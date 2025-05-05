import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


declare global {
    namespace Express {
      interface Request {
        user?: any;
      }
    }
  }

const JWT_SECRET=process.env.JWT_SECRET

// Middleware to authenticate JWT token
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Authentication middleware
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log("token is  ",token)

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded token to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

export default authMiddleware;