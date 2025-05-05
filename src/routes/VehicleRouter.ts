import express, { Request, Response } from 'express';
import Vehicle, { VehicleInput } from '../db/models/Vehicles'; // Ensure you import VehicleInput
import Image from '../db/models/image';
import redisClient from '../../src/redis/redis'; // Ensure the path is correct

const VehicleRouter = express.Router();

// Create a new Vehicle
VehicleRouter.post('/', async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        return res.status(201).json(vehicle);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
});

// Get all Vehicles
VehicleRouter.get('/', async (req, res) => {
    const cacheKey = 'vehicles'; // Define a cache key for vehicles

    try {
        // Check if the vehicles data is already in Redis
        redisClient.get(cacheKey, async (err, cachedData) => {
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
            const vehicles = await Vehicle.findAll({
                include: [{
                    model: Image,
                    as: 'image',
                    attributes: ['image_url'], // Ensure 'image_id' is included
                }],
            });

            if (!vehicles.length) {
                return res.status(404).json({ error: 'No vehicles found' });
            }

            // Store the vehicles data in Redis with an expiration time of 2 seconds
            await redisClient.set(cacheKey, JSON.stringify(vehicles));
            await redisClient.expire(cacheKey, 2);

            // Respond with the vehicles data
            res.status(200).json(vehicles);
        });
    } catch (error: any) {
        console.error('Error in fetching vehicles:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Get a Vehicle by ID
VehicleRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    const cacheKey = `vehicle:${id}`; // Define a cache key based on the vehicle ID

    try {
        // Check if the vehicle data is already in Redis
        redisClient.get(cacheKey, async (err, cachedData) => {
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
            const vehicle = await Vehicle.findByPk(id, {
                include: [{
                    model: Image,
                    as: 'image',
                    attributes: ['image_id'], // Ensure 'image_id' is included
                }],
            });

            if (!vehicle) {
                return res.status(404).json({ error: 'Vehicle not found' });
            }

            // Store the vehicle data in Redis with an expiration time of 2 seconds
            await redisClient.set(cacheKey, JSON.stringify(vehicle));
            await redisClient.expire(cacheKey, 2);

            // Respond with the vehicle data
            res.status(200).json(vehicle);
        });
    } catch (error: any) {
        console.error('Error in fetching vehicle by ID:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Update a Vehicle by ID
VehicleRouter.put('/:id', async (req, res) => {
    try {
        const [updated] = await Vehicle.update(req.body, {
            where: { id: req.params.id },
        });
        if (updated) {
            // Invalidate the cache for this vehicle
            redisClient.del(`vehicle:${req.params.id}`);
            const updatedVehicle = await Vehicle.findByPk(req.params.id);
            return res.status(200).json(updatedVehicle);
        }
        return res.status(404).json({ error: 'Vehicle not found' });
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
});

// Delete a Vehicle by ID
VehicleRouter.delete('/:id', async (req, res) => {
    try {
        const deleted = await Vehicle.destroy({
            where: { id: req.params.id },
        });
        if (deleted) {
            // Invalidate the cache for this vehicle
            redisClient.del(`vehicle:${req.params.id}`);
            return res.status(204).send(); // No content
        }
        return res.status(404).json({ error: 'Vehicle not found' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

VehicleRouter.post('/calculate-prices', async (req: Request, res: Response) => {
    try {
        const { distance } = req.body;

        // Validate distance input
        if (!distance || typeof distance !== 'number' || distance <= 0) {
            return res.status(400).json({ error: 'Invalid distance provided' });
        }

        // Get all vehicles from the database, including image details
        const vehicles = await Vehicle.findAll({
            include: [{
                model: Image,
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
                id:vehicle.id,
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
    } catch (error) {
        console.error('Error calculating prices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default VehicleRouter;
