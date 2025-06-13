import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import XlrUser from '../db/models/xlrUser';
import twilio from 'twilio';

dotenv.config();

const XlrOtpRouter = express.Router();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID,
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
  throw new Error('Twilio env variables are missing');
}

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Send OTP
XlrOtpRouter.post('/send-otp', async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const sanitizedPhone = phone.replace(/\D/g, '');
  if (sanitizedPhone.length !== 10) {
    return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
  }

  const existingUser = await XlrUser.findOne({ where: { phone: sanitizedPhone } });

  if (!existingUser) {
    return res.status(404).json({ error: 'User is inactive' });
  }

  try {
    const response = await twilioClient.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: `+91${sanitizedPhone}`,
        channel: 'sms', // or 'whatsapp' if you’ve enabled it
      });
      console.log(response)
    console.log('OTP send response:', response.status);
    res.json({ message: 'OTP sent successfully', orderId: response.sid });
  } catch (error: any) {
    console.error('Error sending OTP:', error.message);
    res.status(500).json({ error: `Failed to send OTP: ${error.message}` });
  }
});

// Verify OTP
XlrOtpRouter.post('/verify-otp', async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }

  const sanitizedPhone = phone.replace(/\D/g, '');
  if (sanitizedPhone.length !== 10) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  try {
    const verificationCheck = await twilioClient.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${sanitizedPhone}`,
        code: otp,
      });

    if (verificationCheck.status === 'approved') {
      res.json({ message: 'OTP Verified Successfully!' });
    } else {
      res.status(400).json({ error: 'Invalid or expired OTP' });
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error.message);
    res.status(500).json({ error: `Failed to verify OTP: ${error.message}` });
  }
});

export default XlrOtpRouter;
