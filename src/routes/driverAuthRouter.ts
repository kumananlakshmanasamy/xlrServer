import { Router } from "express";
import Driver from '../db/models/driver';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const driverAuthRouter = Router();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID,
  JWT_SECRET
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID || !JWT_SECRET) {
  throw new Error('Twilio credentials or JWT_SECRET are missing in environment variables');
}

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// ✅ Verify OTP and login driver
driverAuthRouter.post('/login', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    // Sanitize and validate phone number
    const sanitizedPhone = phone.replace(/\D/g, '');
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // ✅ Verify OTP using Twilio
    const verifyResponse = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${sanitizedPhone}`,
        code: otp
      });

    console.log('OTP verify status:', verifyResponse.status);

    if (verifyResponse.status === 'approved') {
      const driver = await Driver.findOne({
        where: { phone: sanitizedPhone, is_deleted: false }
      });

      if (driver) {
        const token = jwt.sign(
          { id: driver.driver_id, phone: sanitizedPhone, name: driver.driver_name },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        console.log('JWT Token:', token);
        return res.json({ message: 'OTP Verified Successfully!', token });
      } else {
        return res.status(404).json({ error: 'Driver not found or inactive' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error.message);
    return res.status(500).json({ error: `Failed to verify OTP: ${error.message}` });
  }
});

export default driverAuthRouter;
