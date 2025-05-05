import { Router } from "express";
import Driver from '../db/models/driver' // Adjust path as needed
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const driverAuthRouter = Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const APP_ID = process.env.APP_ID;
const JWT_SECRET = process.env.jwtsecretkey || 'default_secret'; // Fallback to 'default_secret' if not set

if (!CLIENT_ID || !CLIENT_SECRET || !APP_ID || !JWT_SECRET) {
    throw new Error('CLIENT_ID, CLIENT_SECRET, APP_ID, or JWT_SECRET is not defined in environment variables');
}

// Verify OTP and login driver
driverAuthRouter.post('/login', async (req, res) => {
    try {
        const { phone, otp, orderId } = req.body;

        if (!phone || !otp || !orderId) {
            return res.status(400).json({ error: 'Phone number, OTP, and orderId are required' });
        }

        // Sanitize and validate phone number
        const sanitizedPhone = phone.replace(/\D/g, '');
        if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        // Verify OTP using external API
        const response = await axios.post('https://auth.otpless.app/auth/otp/v1/verify', {
            phoneNumber: sanitizedPhone,
            otp,
            orderId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'clientId': CLIENT_ID,
                'clientSecret': CLIENT_SECRET,
                'appId': APP_ID
            }
        });

        console.log('OTP verify response:', response.data);

        if (response.data.isOTPVerified) {
            // Fetch driver by phone number
            const driver = await Driver.findOne({ where: { phone: sanitizedPhone, is_deleted: false } });

            if (driver) {
                // Generate JWT token
                const token = jwt.sign(
                    { id: driver.driver_id, phone: sanitizedPhone, name: driver.driver_name },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );
                console.log('JWT Token:', token); // Log the token

                return res.json({ message: 'OTP Verified Successfully!', token });
            } else {
                return res.status(404).json({ error: 'Driver not found or inactive' });
            }
        } else {
            return res.status(400).json({ error: 'Invalid OTP or phone number' });
        }
    } catch (error: any) {
        console.error('Error verifying OTP:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            error: `Failed to verify OTP: ${error.response?.data?.message || error.message}`
        });
    }
});

export default driverAuthRouter;
