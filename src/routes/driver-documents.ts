import express, { Request, Response } from 'express';
import DriverDocs from '../db/models/driver-documents';
import Driver from '../db/models/driver';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import redisClient from '../../src/redis/redis'

dotenv.config();

const DriverDocsRouter = express.Router();

// Ensure all environment variables are defined
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.BUCKET_REGION || !process.env.BUCKET_NAME) {
  throw new Error('Missing necessary AWS configuration in .env file');
}

// Configure AWS S3 using S3Client
const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer to use S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME as string,
    // acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `images/${Date.now()}_${file.originalname}`);
    },
  }),
});

// Route to upload driver documents
DriverDocsRouter.post('/driverdocs', upload.fields([
  { name: 'front_image', maxCount: 1 },
  { name: 'back_image', maxCount: 1 },
]), async (req: Request, res: Response) => {
  try {
    const { driver_id, doc_type, doc_number, status } = req.body;
    const files = req.files as { [fieldname: string]: Express.MulterS3.File[] };

    // Validate all required fields
    if (!driver_id || !doc_type || !files.front_image || !files.back_image || !doc_number ) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Store document info in database
    const driverDocs = await DriverDocs.create({
      driver_id,
      doc_type,
      front_image: files.front_image[0].location,
      back_image: files.back_image[0].location,
      doc_number,
      status,
    });

    res.status(200).json({ success: true, data: driverDocs });
  } catch (err: any) {
    console.error('Error in /driverdocs:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Get driver document by ID
DriverDocsRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Check if driver document is cached in Redis
    redisClient.get(`driverDoc:${id}`, async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).send({ message: 'Internal server error.' });
      }

      if (cachedData) {
        // If data is found in Redis, parse and return it
        console.log('Cache hit, returning data from Redis');
        return res.status(200).send(JSON.parse(cachedData));
      }

      // Fetch the driver document from the database
      const driverDoc = await DriverDocs.findOne({ where: { doc_id: id } });

      if (!driverDoc) {
        return res.status(404).send({ message: 'Driver document not found.' });
      }

      // Check if the associated driver is not deleted
      const driver = await Driver.findOne({ where: { driver_id: driverDoc.driver_id, is_deleted: false } });
      if (!driver) {
        return res.status(404).send({ message: 'Associated driver not found or is deleted.' });
      }

      // Store the driver document in Redis with an expiration time of 2 seconds
      await redisClient.set(`driverDoc:${id}`, JSON.stringify(driverDoc));
      await redisClient.expire(`driverDoc:${id}`, 2);

      // Respond with the driver document
      return res.status(200).send(driverDoc);
    });
  } catch (error: any) {
    console.error('Error in fetching driver document by ID:', error);
    return res.status(500).send({ message: `Error in fetching driver document: ${error.message}` });
  }
});


// Get all documents for a specific driver

DriverDocsRouter.get('/driver/:driver_id', async (req: Request, res: Response) => {
  const { driver_id } = req.params;

  try {
    // Check if driver documents are cached in Redis
    redisClient.get(`driverDocs:${driver_id}`, async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).send({ message: 'Internal server error.' });
      }

      if (cachedData) {
        console.log('Cache hit, returning data from Redis');
        return res.status(200).send(JSON.parse(cachedData));
      }

      // Check if driver exists and is not deleted
      const driver = await Driver.findOne({
        where: { driver_id, is_deleted: false },
        attributes: ['document_status'], // Fetch only document_status field
      });

      if (!driver) {
        return res.status(404).send({ message: 'Driver not found or is deleted.' });
      }

      // If the driver's document status is approved, respond accordingly
      if (driver.document_status === 'approved') {
        return res.status(200).send({
          message: 'All documents are approved.',
          status: 'approved',
        });
      }

      // Fetch driver documents from the database
      const driverDocs = await DriverDocs.findAll({ where: { driver_id } });

      // Check for required documents
      const requiredDocTypes = [
        'Pancard',
        'Aadhar card',
        'Registration certificate',
        'Driving License',
        'Insurance'
      ];
      const uploadedDocTypes = driverDocs.map(doc => doc.doc_type);
      const missingDocs = requiredDocTypes.filter(docType => !uploadedDocTypes.includes(docType));

      if (missingDocs.length > 0) {
        return res.status(200).send({
          message: 'Some documents are missing.',
          missingDocuments: missingDocs,
          uploadedDocuments: uploadedDocTypes,
        });
      }

      // Store the driver documents in Redis with an expiration time of 2 seconds
      await redisClient.set(`driverDocs:${driver_id}`, JSON.stringify(driverDocs));
      await redisClient.expire(`driverDocs:${driver_id}`, 2);

      return res.status(200).send(driverDocs);
    });
  } catch (error: any) {
    console.error('Error in fetching driver documents:', error);
    return res.status(500).send({
      message: `Error in fetching driver documents: ${error.message}`,
    });
  }
});



// Update driver document
DriverDocsRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { driver_id, doc_type, front_image, back_image, doc_number, status } = req.body;

    const driverDoc = await DriverDocs.findOne({ where: { doc_id: id } });
    if (!driverDoc) {
      return res.status(404).send({ message: 'Driver document not found.' });
    }

    // Check if associated driver is not deleted
    const driver = await Driver.findOne({ where: { driver_id: driverDoc.driver_id, is_deleted: false } });
    if (!driver) {
      return res.status(404).send({ message: 'Associated driver not found or is deleted.' });
    }

    // Update driver document
    const updateDriverDocsObject = { driver_id, doc_type, front_image, back_image, doc_number, status };
    await DriverDocs.update(updateDriverDocsObject, { where: { doc_id: id } });

    return res.status(200).send({ message: 'Driver document updated successfully' });
  } catch (error: any) {
    console.error('Error in updating driver document:', error);
    return res.status(500).send({ message: `Error in updating driver document: ${error.message}` });
  }
});

// Accept document by driver_id
DriverDocsRouter.patch('/accept/:driverId', async (req, res) => {
  const { driverId } = req.params;
  try {
    const document = await DriverDocs.findOne({ where: { driver_id: driverId } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.status = true;
    await document.save();

    res.json({ message: 'Document accepted successfully', document });
  } catch (error) {
    console.error('Error accepting document:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject (delete) document by driver_id
DriverDocsRouter.delete('/:driverId', async (req, res) => {
  const { driverId } = req.params;
  try {
    const document = await DriverDocs.findOne({ where: { driver_id: driverId } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.destroy();

    res.json({ message: 'Document rejected and deleted successfully' });
  } catch (error) {
    console.error('Error rejecting document:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get all documents for all drivers with status false
DriverDocsRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Check if pending driver documents are cached in Redis
    redisClient.get('pendingDriverDocs', async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).send({ message: 'Internal server error.' });
      }

      if (cachedData) {
        // If data is found in Redis, parse and return it
        console.log('Cache hit, returning pending driver documents from Redis');
        return res.status(200).send(JSON.parse(cachedData));
      }

      // Fetch only pending driver documents from the database (where status is false)
      const pendingDriverDocs = await DriverDocs.findAll({
        where: {
          status: false
        }
      });

      // Store the pending driver documents in Redis with an expiration time of 2 seconds
      await redisClient.set('pendingDriverDocs', JSON.stringify(pendingDriverDocs));
      await redisClient.expire('pendingDriverDocs', 2);

      // Respond with the pending driver documents
      return res.status(200).send(pendingDriverDocs);
    });
  } catch (error: any) {
    console.error('Error in fetching pending driver documents:', error);
    return res.status(500).send({ message: `Error in fetching pending driver documents: ${error.message}` });
  }
});


DriverDocsRouter.patch('/driver/:driverId', async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const { doc_type, front_image, back_image, doc_number, status } = req.body;

    // If it's a status update, doc_type can be skipped
    if (!doc_type && !status) {
      return res.status(400).json({ message: 'Either document type or status is required.' });
    }

    // Handle document update if `doc_type` is provided
    if (doc_type) {
      const driverDoc = await DriverDocs.findOne({
        where: { driver_id: driverId, doc_type },
      });

      if (!driverDoc) {
        return res.status(404).send({ message: 'Driver document not found.' });
      }

      const updateDriverDocsObject = { front_image, back_image, doc_number, status };
      await DriverDocs.update(updateDriverDocsObject, { where: { doc_id: driverDoc.doc_id } });
    }

    // If all required documents are uploaded, update driver status
    const allDocumentsUploaded = await DriverDocs.findAll({
      where: { driver_id: driverId, },
    });

    const expectedDocumentCount = 5; // Adjust based on your requirements
    if (allDocumentsUploaded.length === expectedDocumentCount) {
      await Driver.update(
        { document_status: 'under_verification' },
        { where: { driver_id: driverId } }
      );
    }

    return res.status(200).send({ message: 'Driver status or document updated successfully' });
  } catch (error: any) {
    console.error('Error in updating driver document:', error);
    return res.status(500).send({ message: `Error: ${error.message}` });
  }
});


export default DriverDocsRouter;