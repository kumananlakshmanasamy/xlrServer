import express, { Request, Response } from 'express';
import XlrUser from '../db/models/xlrUser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import redisClient from '../../src/redis/redis'; // adjust path if needed

dotenv.config();

const XlrUserRouter = express.Router();

// Create/Register new XlrUser
XlrUserRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { fullname, email, password, phone } = req.body;

    if (!fullname || !email || !password || !phone) {
      return res.status(400).send({ message: 'Please fill in all required fields.' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).send({ message: 'Invalid email format.' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).send({ message: 'Phone number must be 10 digits.' });
    }

    const existingByEmail = await XlrUser.findOne({ where: { email } });
    if (existingByEmail) {
      return res.status(400).send({ message: 'XlrUser with this email already exists.' });
    }

    const existingByPhone = await XlrUser.findOne({ where: { phone } });
    if (existingByPhone) {
      return res.status(400).send({ message: 'XlrUser with this phone number already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await XlrUser.create({
      fullname,
      email,
      password: hashedPassword,
      phone,
    });

    return res.status(200).send({ message: 'XlrUser registered successfully', data: newUser });
  } catch (error: any) {
    console.error('Error registering XlrUser:', error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});

// XlrUser Login
XlrUserRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: 'Please fill in all required fields.' });
    }

    const user = await XlrUser.findOne({ where: { email } });
    if (!user) {
      return res.status(400).send({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return res.status(200).send({ message: 'Login successful', token });
  } catch (error: any) {
    console.error('Error logging in XlrUser:', error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});

// Get XlrUser by ID with Redis Caching
XlrUserRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    redisClient.get(`XlrUser:${id}`, async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).send({ message: 'Internal server error.' });
      }

      if (cachedData) {
        console.log('Cache hit: returning XlrUser from Redis');
        return res.status(200).send(JSON.parse(cachedData));
      }

      const user = await XlrUser.findOne({ where: { id } });

      if (!user) {
        return res.status(404).send({ message: 'XlrUser not found.' });
      }

      await redisClient.set(`XlrUser:${id}`, JSON.stringify(user));
      await redisClient.expire(`XlrUser:${id}`, 60);

      return res.status(200).send(user);
    });
  } catch (error: any) {
    console.error('Error fetching XlrUser:', error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});

// Update Password
XlrUserRouter.put('/reset-password', async (req: Request, res: Response) => {
  try {
    const { phone, newPassword } = req.body;

    if (!phone || !newPassword) {
      return res.status(400).send({ message: 'Phone and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).send({ message: 'Password must be at least 6 characters.' });
    }

    const user = await XlrUser.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).send({ message: 'XlrUser not found.' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).send({ message: 'New password cannot be same as old password.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await XlrUser.update(
      { password: hashedPassword },
      { where: { phone } }
    );

    return res.status(200).send({ message: 'Password updated successfully.' });
  } catch (error: any) {
    console.error('Error updating password:', error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});

export default XlrUserRouter;
