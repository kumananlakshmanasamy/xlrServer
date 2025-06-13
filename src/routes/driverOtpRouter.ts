import express, { Request, Response } from 'express';
import Driver from '../db/models/driver';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';

dotenv.config();

const DriverOTPRouter = express.Router();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID,
  JWT_SECRET
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID || !JWT_SECRET) {
  throw new Error('Twilio or JWT environment variables are missing');
}

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// ✅ Send OTP
DriverOTPRouter.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const sanitizedPhone = phone.replace(/\D/g, '');
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const driver = await Driver.findOne({ where: { phone: sanitizedPhone } });

    if (driver && !driver.active) {
      return res.status(403).json({ error: 'Driver is inactive.' });
    }

    const sendOTP = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: `+91${sanitizedPhone}`,
        channel: 'sms' // or 'whatsapp' if enabled
      });

    console.log('OTP send status:', sendOTP.status);
    res.json({ message: 'OTP sent successfully', orderId: sendOTP.sid });
  } catch (error: any) {
    console.error('Error sending OTP:', error.message);
    res.status(500).json({ error: `Failed to send OTP: ${error.message}` });
  }
});

// ✅ Verify OTP
DriverOTPRouter.post('/verify-otp', async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone number and OTP are required' });

  const sanitizedPhone = phone.replace(/\D/g, '');
  if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  try {
    const verifyResponse = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${sanitizedPhone}`,
        code: otp,
      });

    if (verifyResponse.status === 'approved') {
      const driver = await Driver.findOne({ where: { phone: sanitizedPhone } });

      if (driver) {
        const driverData = {
          driverId: driver.driver_id,
          phone: sanitizedPhone,
          document_status: driver.document_status,
        };

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
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error.message);
    res.status(500).json({ error: `Failed to verify OTP: ${error.message}` });
  }
});

// ✅ Check driver (unchanged)
DriverOTPRouter.get('/check-driver', async (req: Request, res: Response) => {
  const phone = req.query.phone as string;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const driver = await Driver.findOne({ where: { phone, is_deleted: false } });

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
