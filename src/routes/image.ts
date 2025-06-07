import express, { Request, Response, NextFunction } from 'express';
import Image from '../db/models/image';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import redisClient from '../redis/redis';;

dotenv.config();

const ImageRouter = express.Router();

// AWS S3 Configuration
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.BUCKET_REGION || !process.env.BUCKET_NAME) {
  throw new Error('Missing AWS environment configuration');
}

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer-S3 Storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME as string,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `images/${Date.now()}_${file.originalname}`);
    },
  }),
});

// Middleware for multer errors
function multerErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: `Multer Error: ${err.message}` });
  }
  next(err);
}

// ========================
// 📥 Upload an Image
// ========================
ImageRouter.post('/upload', upload.single('image'), multerErrorHandler, async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.MulterS3.File;
    const { alt_text } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: 'Image file is required' });
    }

    const image = await Image.create({
      image_url: file.location,
      alt_text: alt_text || '',
    });

    res.status(201).json({ success: true, data: image });
  } catch (err: any) {
    console.error('Error uploading image:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ========================
// 📄 Get Image by ID
// ========================
ImageRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = `image:${id}`;

  try {
    redisClient.get(cacheKey, async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (cachedData) {
        console.log('Cache hit for image');
        return res.json(JSON.parse(cachedData));
      }

      const image = await Image.findOne({ where: { image_id: id } });

      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }

      await redisClient.set(cacheKey, JSON.stringify(image));
      await redisClient.expire(cacheKey, 2); // Cache for 2 seconds

      res.status(200).json(image);
    });
  } catch (error: any) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

// ========================
// 📄 Get All Images
// ========================
ImageRouter.get('/', async (req: Request, res: Response) => {
  const cacheKey = 'all_images';

  try {
    redisClient.get(cacheKey, async (err, cachedData) => {
      if (err) {
        console.error('Redis error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (cachedData) {
        console.log('Cache hit for all images');
        return res.json(JSON.parse(cachedData));
      }

      const images = await Image.findAll();

      await redisClient.set(cacheKey, JSON.stringify(images));
      await redisClient.expire(cacheKey, 2); // Cache for 2 seconds

      res.status(200).json(images);
    });
  } catch (error: any) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

// ========================
// ✏️ Update Image Alt Text or URL
// ========================
ImageRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { image_url, alt_text } = req.body;

    const image = await Image.findOne({ where: { image_id: id } });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await image.update({ image_url, alt_text });

    res.status(200).json({ message: 'Image updated successfully', data: image });
  } catch (error: any) {
    console.error('Error updating image:', error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

// ========================
// ❌ Delete Image
// ========================
ImageRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const image = await Image.findOne({ where: { image_id: id } });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await image.destroy();

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

export default ImageRouter;
