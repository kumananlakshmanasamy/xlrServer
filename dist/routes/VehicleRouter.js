"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Vehicles_1 = __importDefault(require("../db/models/Vehicles")); // Ensure you import VehicleInput
const image_1 = __importDefault(require("../db/models/image"));
const redis_1 = __importDefault(require("../../src/redis/redis")); // Ensure the path is correct
const VehicleRouter = express_1.default.Router();
// Create a new Vehicle
VehicleRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vehicle = yield Vehicles_1.default.create(req.body);
        return res.status(201).json(vehicle);
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}));
// Get all Vehicles
VehicleRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'vehicles'; // Define a cache key for vehicles
    try {
        // Check if the vehicles data is already in Redis
        redis_1.default.get(cacheKey, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (cachedData) {
                // If data is found in Redis, parse and return it
                console.log('Cache hit, returning data from Redis');
                return res.status(200).json(JSON.parse(cachedData));
            }
            // Fetch the vehicles data from the database
            const vehicles = yield Vehicles_1.default.findAll({
                include: [{
                        model: image_1.default,
                        as: 'image',
                        attributes: ['image_url'], // Ensure 'image_id' is included
                    }],
            });
            if (!vehicles.length) {
                return res.status(404).json({ error: 'No vehicles found' });
            }
            // Store the vehicles data in Redis with an expiration time of 2 seconds
            yield redis_1.default.set(cacheKey, JSON.stringify(vehicles));
            yield redis_1.default.expire(cacheKey, 2);
            // Respond with the vehicles data
            res.status(200).json(vehicles);
        }));
    }
    catch (error) {
        console.error('Error in fetching vehicles:', error);
        return res.status(500).json({ error: error.message });
    }
}));
// Get a Vehicle by ID
VehicleRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const cacheKey = `vehicle:${id}`; // Define a cache key based on the vehicle ID
    try {
        // Check if the vehicle data is already in Redis
        redis_1.default.get(cacheKey, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (cachedData) {
                // If data is found in Redis, parse and return it
                console.log('Cache hit, returning data from Redis');
                return res.status(200).json(JSON.parse(cachedData));
            }
            // Fetch the vehicle data from the database
            const vehicle = yield Vehicles_1.default.findByPk(id, {
                include: [{
                        model: image_1.default,
                        as: 'image',
                        attributes: ['image_id'], // Ensure 'image_id' is included
                    }],
            });
            if (!vehicle) {
                return res.status(404).json({ error: 'Vehicle not found' });
            }
            // Store the vehicle data in Redis with an expiration time of 2 seconds
            yield redis_1.default.set(cacheKey, JSON.stringify(vehicle));
            yield redis_1.default.expire(cacheKey, 2);
            // Respond with the vehicle data
            res.status(200).json(vehicle);
        }));
    }
    catch (error) {
        console.error('Error in fetching vehicle by ID:', error);
        return res.status(500).json({ error: error.message });
    }
}));
// Update a Vehicle by ID
VehicleRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [updated] = yield Vehicles_1.default.update(req.body, {
            where: { id: req.params.id },
        });
        if (updated) {
            // Invalidate the cache for this vehicle
            redis_1.default.del(`vehicle:${req.params.id}`);
            const updatedVehicle = yield Vehicles_1.default.findByPk(req.params.id);
            return res.status(200).json(updatedVehicle);
        }
        return res.status(404).json({ error: 'Vehicle not found' });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
}));
// Delete a Vehicle by ID
VehicleRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield Vehicles_1.default.destroy({
            where: { id: req.params.id },
        });
        if (deleted) {
            // Invalidate the cache for this vehicle
            redis_1.default.del(`vehicle:${req.params.id}`);
            return res.status(204).send(); // No content
        }
        return res.status(404).json({ error: 'Vehicle not found' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}));
VehicleRouter.post('/calculate-prices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { distance } = req.body;
        // Validate distance input
        if (!distance || typeof distance !== 'number' || distance <= 0) {
            return res.status(400).json({ error: 'Invalid distance provided' });
        }
        // Get all vehicles from the database, including image details
        const vehicles = yield Vehicles_1.default.findAll({
            include: [{
                    model: image_1.default,
                    as: 'image',
                    attributes: ['image_url'], // Only include the image_url attribute
                }],
        });
        if (!vehicles.length) {
            return res.status(404).json({ error: 'No vehicles found' });
        }
        // Calculate prices for each vehicle
        const vehiclePrices = vehicles.map(vehicle => {
            // Ensure baseFare and ratePerKm are numbers
            const baseFare = Number(vehicle.baseFare);
            const ratePerKm = Number(vehicle.ratePerKm);
            const estimatedTimePerKm = Number(vehicle.estimatedTimePerKm);
            const totalPrice = baseFare + ratePerKm * distance;
            const estimatedTime = estimatedTimePerKm * distance;
            // Convert estimated time into hours/minutes if necessary
            const formattedTime = estimatedTime >= 60
                ? `${Math.floor(estimatedTime / 60)} hour${Math.floor(estimatedTime / 60) > 1 ? 's' : ''}`
                : `${Math.round(estimatedTime)} min`;
            // Access the image_url from the image association
            const imageUrl = vehicle.image ? vehicle.image.image_url : null;
            return {
                id: vehicle.id,
                vehicleName: vehicle.name,
                capacity: vehicle.capacity,
                baseFare,
                ratePerKm,
                distance,
                totalPrice: Math.round(totalPrice), // No decimal for price
                estimatedTime: formattedTime, // Formatted time with hour/min logic
                image: imageUrl, // Use the correct image URL
            };
        });
        // Send the result as JSON response
        res.json(vehiclePrices);
    }
    catch (error) {
        console.error('Error calculating prices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = VehicleRouter;
