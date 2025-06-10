import express, { Request, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import Passenger from '../db/models/passanger';

dotenv.config();

const passangerroutes = express.Router();

// S3 Configuration
const s3 = new S3Client({
  region: process.env.BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Multer configuration
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET_NAME!,
    key: (req, file, cb) => {
      const filename = `passengers/${Date.now()}_${file.originalname}`;
      cb(null, filename);
    },
  }),
});

const passengerUpload = upload.fields([
  { name: 'visa_document', maxCount: 1 },
  { name: 'ticket_document', maxCount: 1 },
]);

// POST: Create new passenger
passangerroutes.post('/', passengerUpload, async (req: Request, res: Response) => {
  try {
    const {
      hyderabad_name,
      hyderabad_mobile,
      hyderabad_email,
      hyderabad_pickup_location,
      dubai_number,
      dubai_pickup_location,
      date_of_travel,
      luggage_space,
    } = req.body;
    
    const files = req.files as {
      visa_document?: Express.MulterS3.File[];
      ticket_document?: Express.MulterS3.File[];
    };

    // Validation
    if (
      !hyderabad_name ||
      !hyderabad_mobile ||
      !hyderabad_email ||
      !hyderabad_pickup_location ||
      !dubai_number ||
      !dubai_pickup_location ||
      !date_of_travel ||
      !files?.visa_document?.[0] ||
      !files?.ticket_document?.[0]
    ) {
      return res.status(400).json({
        success: false,
        error: 'All required fields and documents must be provided.',
      });
    }

    const visaUrl = files.visa_document[0].location;
    const ticketUrl = files.ticket_document[0].location;

    const passenger = await Passenger.create({
      hyderabad_name,
      hyderabad_mobile,
      hyderabad_email,
      hyderabad_pickup_location,
      dubai_number,
      dubai_pickup_location,
      date_of_travel,
      visa_document: visaUrl,
      ticket_document: ticketUrl,
      luggage_space: luggage_space || null,
    });

    res.status(201).json({ success: true, data: passenger });
  } catch (error: any) {
    console.error('Passenger Upload Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: All passengers
passangerroutes.get('/', async (_req: Request, res: Response) => {
  try {
    const passengers = await Passenger.findAll();
    res.json({ success: true, data: passengers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Passenger by ID
passangerroutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const passenger = await Passenger.findByPk(req.params.id);
    if (!passenger) {
      return res.status(404).json({ success: false, message: 'Passenger not found' });
    }
    res.json({ success: true, data: passenger });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT: Update passenger
passangerroutes.put('/:id', async (req: Request, res: Response) => {
  try {
    const [updated] = await Passenger.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Passenger not found or no changes made' });
    }

    const updatedPassenger = await Passenger.findByPk(req.params.id);
    res.json({ success: true, data: updatedPassenger });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Remove passenger
passangerroutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await Passenger.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Passenger not found' });
    }

    res.json({ success: true, message: 'Passenger deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default passangerroutes;
