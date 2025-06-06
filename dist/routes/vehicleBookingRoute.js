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
const vehicleBooking_1 = __importDefault(require("../db/models/vehicleBooking"));
const redis_1 = __importDefault(require("../../src/redis/redis")); // Assuming redisClient is used for caching
const vehicleBookingRouter = express_1.default.Router();
vehicleBookingRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, vehicle_id, pickup_address, dropoff_address, goods_type, total_price, sender_name, sender_phone, receiver_name, receiver_phone, vehicle_name, vehicle_image, status = 'pending', driver_id, payment_method } = req.body;
        // Validate required fields
        if (!user_id || !pickup_address || !dropoff_address || !goods_type || !total_price || !sender_name || !sender_phone || !receiver_name || !receiver_phone) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }
        // Create vehicleBooking
        const booking = yield vehicleBooking_1.default.create({
            user_id, vehicle_id, pickup_address, dropoff_address, goods_type, total_price, sender_name, sender_phone, receiver_name,
            receiver_phone, vehicle_name, vehicle_image, status, driver_id, payment_method
        });
        return res.status(200).send({ message: 'Booking created successfully', data: booking });
    }
    catch (error) {
        console.error('Error in creating vehicle booking:', error);
        return res.status(500).send({ message: `Error in creating booking: ${error.message}` });
    }
}));
// Get all vehicle bookings
vehicleBookingRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        redis_1.default.get('allVehicleBookings', (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error.' });
            }
            if (cachedData) {
                console.log('Cache hit, returning data from Redis');
                return res.status(200).send(JSON.parse(cachedData));
            }
            // Fetch from database if not found in Redis
            const bookings = yield vehicleBooking_1.default.findAll();
            if (bookings.length === 0) {
                return res.status(404).send({ message: 'No vehicle bookings found.' });
            }
            // Cache the results
            yield redis_1.default.set('allVehicleBookings', JSON.stringify(bookings));
            yield redis_1.default.expire('allVehicleBookings', 2); // Cache for 2 seconds
            return res.status(200).send(bookings);
        }));
    }
    catch (error) {
        console.error('Error in fetching vehicle bookings:', error);
        return res.status(500).send({ message: `Error in fetching vehicle bookings: ${error.message}` });
    }
}));
// Get a vehicle booking by user_id
vehicleBookingRouter.get('/user/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        // Check if bookings for this user_id are already cached in Redis
        redis_1.default.get(`vehicleBookings:${user_id}`, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error.' });
            }
            if (cachedData) {
                // If data is found in Redis, parse it and return it
                console.log('Cache hit, returning data from Redis');
                return res.status(200).send(JSON.parse(cachedData));
            }
            // If data is not in Redis, fetch from the database
            const bookings = yield vehicleBooking_1.default.findAll({
                where: { user_id }
            });
            // If no bookings are found, send a 404 response
            if (bookings.length === 0) {
                return res.status(404).send({ message: 'No bookings found for this user.' });
            }
            // Cache the bookings in Redis with an expiration time (e.g., 3 minutes)
            redis_1.default.set(`vehicleBookings:${user_id}`, JSON.stringify(bookings));
            redis_1.default.expire(`vehicleBookings:${user_id}`, 1);
            // Return the bookings
            return res.status(200).send({ data: bookings });
        }));
    }
    catch (error) {
        console.error('Error fetching bookings by user_id:', error);
        return res.status(500).send({ message: `Error in fetching bookings: ${error.message}` });
    }
}));
// Get a vehicle booking by ID
vehicleBookingRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        redis_1.default.get(`vehicleBooking:${id}`, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error.' });
            }
            if (cachedData) {
                console.log('Cache hit, returning data from Redis');
                return res.status(200).send(JSON.parse(cachedData));
            }
            const booking = yield vehicleBooking_1.default.findOne({ where: { id } });
            if (!booking) {
                return res.status(404).send({ message: 'Vehicle booking not found.' });
            }
            // Cache the booking data
            yield redis_1.default.set(`vehicleBooking:${id}`, JSON.stringify(booking));
            yield redis_1.default.expire(`vehicleBooking:${id}`, 2);
            return res.status(200).send(booking);
        }));
    }
    catch (error) {
        console.error('Error in fetching vehicle booking by ID:', error);
        return res.status(500).send({ message: `Error in fetching vehicle booking: ${error.message}` });
    }
}));
// Update a vehicle booking by ID (PATCH)
vehicleBookingRouter.patch('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { user_id, vehicle_id, pickup_address, dropoff_address, goods_type, total_price, sender_name, sender_phone, receiver_name, receiver_phone, vehicle_name, vehicle_image, status, driver_id, payment_method } = req.body;
        const booking = yield vehicleBooking_1.default.findOne({ where: { id } });
        if (!booking) {
            return res.status(404).send({ message: 'Vehicle booking not found.' });
        }
        // Update the booking
        yield vehicleBooking_1.default.update({
            user_id, vehicle_id, pickup_address, dropoff_address, goods_type, total_price,
            sender_name, sender_phone, receiver_name, receiver_phone, vehicle_name, vehicle_image, status, driver_id, payment_method
        }, {
            where: { id }
        });
        return res.status(200).send({ message: 'Vehicle booking updated successfully' });
    }
    catch (error) {
        console.error('Error in updating vehicle booking:', error);
        return res.status(500).send({ message: `Error in updating vehicle booking: ${error.message}` });
    }
}));
exports.default = vehicleBookingRouter;
