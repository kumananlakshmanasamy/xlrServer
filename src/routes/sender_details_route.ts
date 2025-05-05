import express, { Request, Response } from 'express';
import SenderDetails from '../db/models/sender_details';
import redisClient from '../../src/redis/redis';

const SenderDetailsRouter = express.Router();

// Create a new sender detail
SenderDetailsRouter.post('/', async (req: Request, res: Response) => {
    try {
        const { sender_name, mobile_number, user_id, address, address_type } = req.body;

        // Validate required fields
        if (!sender_name || !mobile_number || !user_id || !address || !address_type) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }

        // Validate address_type
        const validAddressTypes = ['Home', 'Shop', 'Other'];
        if (!validAddressTypes.includes(address_type)) {
            return res.status(400).send({ message: 'Invalid address type.' });
        }

        // Create sender detail
        const senderDetail = await SenderDetails.create({
            sender_name,
            mobile_number,
            user_id,
            address,
            address_type,
        });

        return res.status(200).send({ message: 'Sender detail created successfully', data: senderDetail });
    } catch (error: any) {
        console.error('Error in creating sender detail:', error);
        return res.status(500).send({ message: `Error in creating sender detail: ${error.message}` });
    }
});

// Get all sender details
SenderDetailsRouter.get('/', async (req: Request, res: Response) => {
    const cacheKey = 'senderDetails';

    try {
        redisClient.get(cacheKey, async (err, cachedData) => {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error' });
            }

            if (cachedData) {
                console.log('Cache hit, returning data from Redis');
                return res.status(200).send(JSON.parse(cachedData));
            }

            const senderDetails = await SenderDetails.findAll();
            await redisClient.set(cacheKey, JSON.stringify(senderDetails));
            await redisClient.expire(cacheKey, 2);

            res.status(200).send(senderDetails);
        });
    } catch (error: any) {
        console.error('Error in fetching sender details:', error);
        res.status(500).send({ message: `Error in fetching sender details: ${error.message}` });
    }
});

// Get a sender detail by ID
SenderDetailsRouter.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const cacheKey = `senderDetail:${id}`;

    try {
        redisClient.get(cacheKey, async (err, cachedData) => {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error' });
            }

            if (cachedData) {
                console.log('Cache hit, returning data from Redis');
                return res.status(200).send(JSON.parse(cachedData));
            }

            const senderDetail = await SenderDetails.findOne({ where: { sender_id: id } });

            if (!senderDetail) {
                return res.status(404).send({ message: 'Sender detail not found.' });
            }

            await redisClient.set(cacheKey, JSON.stringify(senderDetail));
            await redisClient.expire(cacheKey, 2);

            res.status(200).send(senderDetail);
        });
    } catch (error: any) {
        console.error('Error in fetching sender detail by ID:', error);
        res.status(500).send({ message: `Error in fetching sender detail: ${error.message}` });
    }
});

// Update a sender detail
SenderDetailsRouter.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { sender_name, mobile_number, user_id, address, address_type } = req.body;

        // Validate address_type
        const validAddressTypes = ['Home', 'Shop', 'Other'];
        if (address_type && !validAddressTypes.includes(address_type)) {
            return res.status(400).send({ message: 'Invalid address type.' });
        }

        const senderDetail = await SenderDetails.findOne({ where: { sender_id: id } });
        if (!senderDetail) {
            return res.status(404).send({ message: 'Sender detail not found.' });
        }

        // Update sender detail
        await SenderDetails.update(
            { sender_name, mobile_number, user_id, address, address_type },
            { where: { sender_id: id } }
        );

        return res.status(200).send({ message: 'Sender detail updated successfully' });
    } catch (error: any) {
        console.error('Error in updating sender detail:', error);
        return res.status(500).send({ message: `Error in updating sender detail: ${error.message}` });
    }
});

// Delete (soft delete) a sender detail
SenderDetailsRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const senderDetail = await SenderDetails.findOne({ where: { sender_id: id } });
        if (!senderDetail) {
            return res.status(404).send({ message: 'Sender detail not found.' });
        }

        await SenderDetails.destroy({ where: { sender_id: id } });

        return res.status(200).send({ message: 'Sender detail deleted successfully' });
    } catch (error: any) {
        console.error('Error in deleting sender detail:', error);
        return res.status(500).send({ message: `Error in deleting sender detail: ${error.message}` });
    }
});

export default SenderDetailsRouter;
