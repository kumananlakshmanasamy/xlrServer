import express, { Request, Response } from 'express';
import Driver from '../db/models/driver';
import axios from 'axios';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { where } from 'sequelize';


dotenv.config();
const DriverOTPRouter = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const APP_ID = process.env.APP_ID;
const JWT_SECRET = process.env.JWT_SECRET;


if (!CLIENT_ID || !CLIENT_SECRET || !APP_ID || !JWT_SECRET) {
  throw new Error('CLIENT_ID, CLIENT_SECRET, APP_ID, or JWT_SECRET is not defined in environment variables');
}

// Temporary storage for demonstration purposes
DriverOTPRouter.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const sanitizedPhone = phone.replace(/\D/g, ''); // Remove non-digit characters
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check if the driver exists in the database
    const driver = await Driver.findOne({ where: { phone: sanitizedPhone } });

    if (!driver) {
      // If the driver does not exist, it means a new driver, send OTP
      const otpResponse = await axios.post(
        'https://auth.otpless.app/auth/otp/v1/send',
        {
          phoneNumber: `91${sanitizedPhone}`,
          otpLength: 4,
          channel: 'SMS',
          expiry: 600, // OTP expiry in seconds (10 minutes)
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

      console.log('OTP send response:', otpResponse.data);

      if (otpResponse.data.orderId) {
        return res.json({ message: 'OTP sent successfully', orderId: otpResponse.data.orderId });
      } else {
        throw new Error(`OTP service error: ${otpResponse.data.message || 'Unknown error'}`);
      }
    }

    // If the driver exists, check their status
    if (!driver.active) {
      return res.status(403).json({ error: 'Driver is inactive.' });
    }
    // Send OTP via external service
    const otpResponse = await axios.post(
      'https://auth.otpless.app/auth/otp/v1/send',
      {
        phoneNumber: `91${sanitizedPhone}`, // Prefix with country code
        otpLength: 4,
        channel: 'SMS',
        expiry: 600, // OTP expiry in seconds (10 minutes)
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

    console.log('OTP send response:', otpResponse.data);

    if (otpResponse.data.orderId) {
      // Optionally save orderId to DB for future reference
      res.json({ message: 'OTP sent successfully', orderId: otpResponse.data.orderId });
    } else {
      throw new Error(`OTP service error: ${otpResponse.data.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: `Failed to send OTP: ${error.response?.data?.message || error.message}`,
    });
  }
});

DriverOTPRouter.post('/verify-otp', async (req: Request, res: Response) => {
  const { phone, otp, orderId } = req.body;

  if (!phone || !otp || !orderId) {
    return res.status(400).json({ error: 'Phone number, OTP, and orderId are required' });
  }

  const sanitizedPhone = phone.replace(/\D/g, '');
  if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  try {
    const response = await axios.post('https://auth.otpless.app/auth/otp/v1/verify', {
      phoneNumber: `91${sanitizedPhone}`,
      otp,
      orderId,
    }, {
      headers: {
        'Content-Type': 'application/json',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        appId: APP_ID,
      }
    });

    if (response.data.isOTPVerified) {
      const driver = await Driver.findOne({ where: { phone: sanitizedPhone } });

      if (driver) {
        const driverData = {
          driverId: driver.driver_id,
          phone: sanitizedPhone,
          document_status: driver.document_status,
        };

        // Check document status
        switch (driver.document_status) {
          case 'pending':
            return res.status(200).json({
              message: 'Documents are pending. Please upload your documents.',
              ...driverData,
            });

          case 'under_verification':
            return res.status(200).json({
              message: 'Documents are under verification.',
              ...driverData,
            });

          case 'approved':
            const token = jwt.sign(
              { id: driver.driver_id, phone: sanitizedPhone },
              JWT_SECRET,
              { expiresIn: '12h' }
            );
            console.log('JWT Token:', token);
            return res.json({
              message: 'OTP Verified Successfully!',
              token,
              ...driverData,
            });

          default:
            return res.status(400).json({ message: 'Invalid document status.' });
        }
      } else {
        return res.status(404).json({ error: 'Driver not found' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid OTP or phone number' });
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: `Failed to verify OTP: ${error.response?.data?.message || error.message}`,
    });
  }
});


DriverOTPRouter.get('/check-driver', async (req: Request, res: Response) => {
  const phone = req.query.phone as string; // Ensure phoneNumber is treated as a string

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const driver = await Driver.findOne({ where: { phone: phone, is_deleted: false } });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found or inactive' });
    }

    res.json(driver);
  } catch (error) {
    console.error('Error fetching driver details:', error);
    res.status(500).json({ error: 'Failed to fetch driver details' });
  }
});

export default DriverOTPRouter;