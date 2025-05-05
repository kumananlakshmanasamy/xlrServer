import express, { Request, Response } from 'express';
import vehicleBooking from '../db/models/vehicleBooking';
import redisClient from '../../src/redis/redis'; // Assuming redisClient is used for caching

const vehicleBookingRouter = express.Router();

vehicleBookingRouter.post('/', async (req: Request, res: Response) => {
    try {
        const {
            user_id,vehicle_id,pickup_address,dropoff_address,goods_type,total_price,sender_name,sender_phone,receiver_name,
            receiver_phone,vehicle_name,vehicle_image,status = 'pending',driver_id,payment_method} = req.body;

        // Validate required fields
        if (!user_id || !pickup_address || !dropoff_address || !goods_type || !total_price || !sender_name || !sender_phone || !receiver_name || !receiver_phone) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }

        // Create vehicleBooking
        const booking = await vehicleBooking.create({
            user_id,vehicle_id,pickup_address,dropoff_address,goods_type,total_price,sender_name,sender_phone,receiver_name,
            receiver_phone,vehicle_name,vehicle_image,status,driver_id,payment_method
        });

        return res.status(200).send({ message: 'Booking created successfully', data: booking });
    } catch (error: any) {
        console.error('Error in creating vehicle booking:', error);
        return res.status(500).send({ message: `Error in creating booking: ${error.message}` });
    }
});


// Get all vehicle bookings
vehicleBookingRouter.get('/', async (req: Request, res: Response) => {
    try {
        redisClient.get('allVehicleBookings', async (err, cachedData) => {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error.' });
            }

            if (cachedData) {
                console.log('Cache hit, returning data from Redis');
                return res.status(200).send(JSON.parse(cachedData));
            }

            // Fetch from database if not found in Redis
            const bookings = await vehicleBooking.findAll();

            if (bookings.length === 0) {
                return res.status(404).send({ message: 'No vehicle bookings found.' });
            }

            // Cache the results
            await redisClient.set('allVehicleBookings', JSON.stringify(bookings));
            await redisClient.expire('allVehicleBookings', 2); // Cache for 2 seconds

            return res.status(200).send(bookings);
        });
    } catch (error: any) {
        console.error('Error in fetching vehicle bookings:', error);
        return res.status(500).send({ message: `Error in fetching vehicle bookings: ${error.message}` });
    }
});
// Get a vehicle booking by user_id
vehicleBookingRouter.get('/user/:user_id', async (req: Request, res: Response) => {
    try {
        const { user_id } = req.params;

        // Check if bookings for this user_id are already cached in Redis
        redisClient.get(`vehicleBookings:${user_id}`, async (err, cachedData) => {
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
            const bookings = await vehicleBooking.findAll({
                where: { user_id }
            });

            // If no bookings are found, send a 404 response
            if (bookings.length === 0) {
                return res.status(404).send({ message: 'No bookings found for this user.' });
            }

            // Cache the bookings in Redis with an expiration time (e.g., 3 minutes)
            redisClient.set(`vehicleBookings:${user_id}`, JSON.stringify(bookings));
            redisClient.expire(`vehicleBookings:${user_id}`, 1); 

            // Return the bookings
            return res.status(200).send({ data: bookings });
        });
    } catch (error: any) {
        console.error('Error fetching bookings by user_id:', error);
        return res.status(500).send({ message: `Error in fetching bookings: ${error.message}` });
    }
});

// Get a vehicle booking by ID
vehicleBookingRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        redisClient.get(`vehicleBooking:${id}`, async (err, cachedData) => {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error.' });
            }

            if (cachedData) {
                console.log('Cache hit, returning data from Redis');
                return res.status(200).send(JSON.parse(cachedData));
            }

            const booking = await vehicleBooking.findOne({ where: { id } });

            if (!booking) {
                return res.status(404).send({ message: 'Vehicle booking not found.' });
            }

            // Cache the booking data
            await redisClient.set(`vehicleBooking:${id}`, JSON.stringify(booking));
            await redisClient.expire(`vehicleBooking:${id}`, 2);

            return res.status(200).send(booking);
        });
    } catch (error: any) {
        console.error('Error in fetching vehicle booking by ID:', error);
        return res.status(500).send({ message: `Error in fetching vehicle booking: ${error.message}` });
    }
});

// Update a vehicle booking by ID (PATCH)
vehicleBookingRouter.patch('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            user_id, vehicle_id, pickup_address, dropoff_address, goods_type, total_price,
            sender_name, sender_phone, receiver_name, receiver_phone, vehicle_name, vehicle_image, status,driver_id,payment_method
        } = req.body;

        const booking = await vehicleBooking.findOne({ where: { id } });

        if (!booking) {
            return res.status(404).send({ message: 'Vehicle booking not found.' });
        }

        // Update the booking
        await vehicleBooking.update({
            user_id, vehicle_id, pickup_address, dropoff_address, goods_type, total_price,
            sender_name, sender_phone, receiver_name, receiver_phone, vehicle_name, vehicle_image, status,driver_id, payment_method
        }, {
            where: { id }
        });

        return res.status(200).send({ message: 'Vehicle booking updated successfully' });
    } catch (error: any) {
        console.error('Error in updating vehicle booking:', error);
        return res.status(500).send({ message: `Error in updating vehicle booking: ${error.message}` });
    }
});

export default vehicleBookingRouter;
