import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import User from '../db/models/users';

dotenv.config();

const OTPRouter = express.Router();

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

// ✅ Send OTP
OTPRouter.post('/send-otp', async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const sanitizedPhone = phone.replace(/\D/g, '');
  if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  try {
    const sendOTP = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: `+91${sanitizedPhone}`,
        channel: 'sms'
      });

    console.log('OTP send status:', sendOTP.status);

    res.json({ message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Error sending OTP:', error.message);
    res.status(500).json({ error: `Failed to send OTP: ${error.message}` });
  }
});

// ✅ Verify OTP
OTPRouter.post('/verify-otp', async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }

  const sanitizedPhone = phone.replace(/\D/g, '');
  if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  try {
    const verifyResponse = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${sanitizedPhone}`,
        code: otp
      });

    console.log('OTP verify status:', verifyResponse.status);

    if (verifyResponse.status === 'approved') {
      const user = await User.findOne({ where: { phone: sanitizedPhone } });

      if (user) {
        const token = jwt.sign(
          { id: user.id, phone: sanitizedPhone, name: user.username },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        console.log('JWT Token:', token);

        res.json({ message: 'OTP Verified Successfully!', token });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      res.status(400).json({ error: 'Invalid or expired OTP' });
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error.message);
    res.status(500).json({ error: `Failed to verify OTP: ${error.message}` });
  }
});

export default OTPRouter;
