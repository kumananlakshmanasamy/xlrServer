
import express, { Request, Response } from 'express';
import Address from '../db/models/Address'; 
import redisClient from '../redis/redis';

const AddressRouter = express.Router();

AddressRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const { house_number, apartment, landmark, type, user_id, city, state, zipcode, country, alternative_phone_number } = req.body;

  
    if (!house_number || !type || !user_id) {
      return res.status(400).send({ message: 'Please fill in all required fields.' });
    }


    const newAddress = await Address.create({
      house_number,
      apartment,
      landmark,
      type,
      user_id,
      city,
      state,
      zipcode,
      country,
      alternative_phone_number
    });

    return res.status(201).send({ message: 'Address created successfully', address: newAddress });
  } catch (error: any) {
    console.error('Error creating address:', error);
    return res.status(500).send({ message: `Error creating address: ${error.message}` });
  }
});

// Route to update an existing address
AddressRouter.patch('/update/:address_id', async (req: Request, res: Response) => {
  try {
    const { address_id } = req.params;
    const { house_number, apartment, landmark, type, user_id, city, state, zipcode, country, alternative_phone_number } = req.body;

    // Find address by ID
    const address = await Address.findByPk(address_id);
    if (!address) {
      return res.status(404).send({ message: 'Address not found.' });
    }

    // Update address details
    await address.update({
      house_number,
      apartment,
      landmark,
      type,
      user_id,
      city,
      state,
      zipcode,
      country,
      alternative_phone_number
    });

    return res.status(200).send({ message: 'Address updated successfully', address });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return res.status(500).send({ message: `Error updating address: ${error.message}` });
  }
});


// Route to retrieve addresses by user_id
AddressRouter.get('/user/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    // Convert user_id to integer
    const userId = parseInt(user_id, 10);
    if (isNaN(userId)) {
      return res.status(400).send({ message: 'Invalid user ID.' });
    }

    // Check if the addresses for the user are already in Redis
    redisClient.get(`addresses:${userId}`, async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).send({ message: 'Internal server error.' });
      }

      if (cachedData) {
        // If data is found in Redis, return it
        console.log('Cache hit, returning data from Redis');
        return res.status(200).send({ addresses: JSON.parse(cachedData) });
      }

      // If data is not in Redis, fetch from the database
      const addresses = await Address.findAll({ where: { user_id: userId } });

      if (addresses.length === 0) {
        return res.status(404).send({ message: 'No addresses found for this user.' });
      }

      // Store the addresses in Redis with an expiration time of 2 seconds
      await redisClient.set(`addresses:${userId}`, JSON.stringify(addresses));
      await redisClient.expire(`addresses:${userId}`, 2);

      // Respond with the addresses
      res.status(200).send({ addresses });
    });
  } catch (error: any) {
    console.error('Error retrieving addresses by user_id:', error);
    return res.status(500).send({ message: `Error retrieving addresses: ${error.message}` });
  }
});


AddressRouter.patch('/update/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { house_number, apartment, landmark, type, city, state, zipcode, country, alternative_phone_number } = req.body;

    // Find address by user ID
    const address = await Address.findOne({ where: { user_id } });
    if (!address) {
      return res.status(404).send({ message: 'Address not found for the specified user ID.' });
    }

    // Update address details
    await address.update({
      house_number,
      apartment,
      landmark,
      type,
      city,
      state,
      zipcode,
      country,
      alternative_phone_number
    });

    return res.status(200).send({ message: 'Address updated successfully', address });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return res.status(500).send({ message: `Error updating address: ${error.message}` });
  }
});

// Route to retrieve an address by ID

AddressRouter.get('/details/:address_id', async (req: Request, res: Response) => {
  try {
    const { address_id } = req.params;

    // Check if the address details are already in Redis
    redisClient.get(`addressDetails:${address_id}`, async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).send({ message: 'Internal server error.' });
      }

      if (cachedData) {
        // If data is found in Redis, return it
        console.log('Cache hit, returning data from Redis');
        return res.status(200).send({ address: JSON.parse(cachedData) });
      }

      // If data is not in Redis, fetch from the database
      const address = await Address.findByPk(address_id);

      if (!address) {
        return res.status(404).send({ message: 'Address not found.' });
      }

      // Store the address details in Redis with an expiration time of 2 seconds
      await redisClient.set(`addressDetails:${address_id}`, JSON.stringify(address));
      await redisClient.expire(`addressDetails:${address_id}`, 2);

      // Respond with the address details
      res.status(200).send({ address });
    });
  } catch (error: any) {
    console.error('Error retrieving address details:', error);
    return res.status(500).send({ message: `Error retrieving address details: ${error.message}` });
  }
});


// Route to delete an address by ID
AddressRouter.delete('/delete/:address_id', async (req: Request, res: Response) => {
  try {
    const { address_id } = req.params;

    // Find and delete address by ID
    const result = await Address.destroy({ where: { address_id } });
    if (result === 0) {
      return res.status(404).send({ message: 'Address not found.' });
    }

    return res.status(200).send({ message: 'Address deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return res.status(500).send({ message: `Error deleting address: ${error.message}` });
  }
});

AddressRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Check if all addresses are already cached in Redis
    redisClient.get('allAddresses', async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).send({ message: 'Internal server error.' });
      }

      if (cachedData) {
        // If the data is found in Redis, parse it and return it
        console.log('Cache hit, returning data from Redis');
        return res.status(200).json({ addresses: JSON.parse(cachedData) });
      }

      // If data is not found in Redis, fetch it from the database
      const addresses = await Address.findAll();

      if (addresses.length === 0) {
        return res.status(404).send({ message: 'No addresses found.' });
      }

      // Cache all addresses in Redis with a 2 seconds expiration
      await redisClient.set('allAddresses', JSON.stringify(addresses));
      await redisClient.expire('allAddresses', 2);

      // Respond with the addresses
      return res.status(200).json({ addresses });
    });
  } catch (error: any) {
    console.error('Error retrieving addresses:', error);
    return res.status(500).send({ message: `Error retrieving addresses: ${error.message}` });
  }
});



AddressRouter.post('/user/:user_id/create', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { house_number, apartment, landmark, type, city, state, zipcode, country, alternative_phone_number } = req.body;

    if (!house_number || !type) {
      return res.status(400).send({ message: 'Please fill in all required fields.' });
    }

    const newAddress = await Address.create({
      house_number,
      apartment,
      landmark,
      type,
      user_id: parseInt(user_id, 10),
      city,
      state,
      zipcode,
      country,
      alternative_phone_number
    });

    return res.status(201).send({ message: 'Address created successfully', address: newAddress });
  } catch (error: any) {
    console.error('Error creating address:', error);
    return res.status(500).send({ message: `Error creating address: ${error.message}` });
  }
});

export default AddressRouter;






