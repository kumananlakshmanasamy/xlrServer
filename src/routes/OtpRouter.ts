import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../db/models/users';

dotenv.config();

const OTPRouter = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const APP_ID = process.env.APP_ID;
const JWT_SECRET = process.env.JWT_SECRET; 

if (!CLIENT_ID || !CLIENT_SECRET || !APP_ID || !JWT_SECRET) {
  throw new Error('CLIENT_ID, CLIENT_SECRET, APP_ID, or JWT_SECRET is not defined in environment variables');
}

// Generate and send OTP
OTPRouter.post('/send-otp', async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Sanitize and validate the phone number
  const sanitizedPhone = phone.replace(/\D/g, ''); // Remove non-digit characters
  if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  // Check if the user exists
  // const existingUser = await User.findOne({
  //   where: {
  //     phone: sanitizedPhone,
  //     active: true, // Use a boolean value directly, not a string.
  //   },
  // });

  // if (!existingUser) {
  //   return res.status(404).json({ error: 'User is inactive' });
  // }

  try {
    // Send OTP via external service
    const response = await axios.post(
      'https://auth.otpless.app/auth/otp/v1/send',
      {
        phoneNumber: `91${sanitizedPhone}`, // Prefix with country code
        otpLength: 4,
        channel: 'SMS',
        expiry: 600, // OTP expires in 10 minutes
      },
      {
        headers: {
          'Content-Type': 'application/json',
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          appId: APP_ID,
        },
      }
    );

    console.log('OTP send response:', response.data);

    if (response.data.orderId) {
      res.json({ message: 'OTP sent successfully', orderId: response.data.orderId });
    } else {
      throw new Error(`Failed to send OTP: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: `Failed to send OTP: ${error.response?.data?.message || error.message}`,
    });
  }
});

OTPRouter.post('/verify-otp', async (req: Request, res: Response) => {
  const { phone, otp, orderId } = req.body;

  if (!phone || !otp || !orderId) {
    return res.status(400).json({ error: 'Phone number, OTP, and orderId are required' });
  }

  // Sanitize and validate phone number
  const sanitizedPhone = phone.replace(/\D/g, '');
  if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  try {
    const response = await axios.post('https://auth.otpless.app/auth/otp/v1/verify', {
      phoneNumber: 91+sanitizedPhone,
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
      // Fetch user by phone number
      const user = await User.findOne({ where: { phone: sanitizedPhone } });

      if (user) {
        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, phone: sanitizedPhone , name:user.username}, // Include user ID in payload
          JWT_SECRET, 
          { expiresIn: '7d' }
        );
        console.log('JWT Token:', token,phone,); // Log the token

        res.json({ message: 'OTP Verified Successfully!', token });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      res.status(400).json({ error: 'Invalid OTP or phone number' });
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: `Failed to verify OTP: ${error.response?.data?.message || error.message}`
    });
  }
});


export default OTPRouter;
