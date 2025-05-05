"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vehicle_1 = __importDefault(require("../db/models/vehicle"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const VehicleRouter = express_1.default.Router();
function isError(error) {
    return error instanceof Error;
}
// Ensure all environment variables are defined
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.BUCKET_REGION || !process.env.BUCKET_NAME) {
    throw new Error('Missing necessary AWS configuration in .env file');
}
// Configure AWS S3 using S3Client
const s3 = new client_s3_1.S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
// Configure multer to use S3
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: process.env.BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `vehicles/${Date.now()}_${file.originalname}`);
        },
    }),
});
// Middleware to handle multer errors
function multerErrorHandler(err, req, res, next) {
    if (err instanceof multer_1.default.MulterError) {
        return res.status(400).json({ success: false, error: `Multer Error: ${err.message}` });
    }
    next(err);
}
// Route to create a new vehicle with image upload
VehicleRouter.post('/post/create', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Request Fields:', req.body);
    console.log('Request File:', req.file);
    try {
        const file = req.file;
        const { name, capacity, price } = req.body;
        if (!name || !capacity || !price || !file) {
            return res.status(400).json({ success: false, error: 'All required fields are not provided' });
        }
        const newVehicle = yield vehicle_1.default.create({
            name,
            capacity,
            price,
            image: file.location,
        });
        res.status(201).json({ success: true, data: newVehicle });
    }
    catch (err) {
        console.error('Error in /create:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
}));
// // Create a new vehicle
// VehicleRouter.post('/post', async (req: Request, res: Response) => {
//   try {
//     const { name, capacity, image, price } = req.body;
//     const vehicle = await Vehicle.create({ name, capacity, image, price });
//     res.status(201).json(vehicle);
//   } catch (error) {
//     if (isError(error)) {
//       res.status(400).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: 'An unknown error occurred' });
//     }
//   }
// });
// Get all vehicles
VehicleRouter.get('/vehicles', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vehicles = yield vehicle_1.default.findAll();
        res.status(200).json(vehicles);
    }
    catch (error) {
        if (isError(error)) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}));
// Get a vehicle by ID
VehicleRouter.get('/vehicles/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const vehicle = yield vehicle_1.default.findByPk(id);
        if (vehicle) {
            res.status(200).json(vehicle);
        }
        else {
            res.status(404).json({ error: 'Vehicle not found' });
        }
    }
    catch (error) {
        if (isError(error)) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}));
// Update a vehicle by ID
VehicleRouter.put('/vehicles/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, capacity, image, price } = req.body;
        const vehicle = yield vehicle_1.default.findByPk(id);
        if (vehicle) {
            yield vehicle.update({ name, capacity, image, price });
            res.status(200).json(vehicle);
        }
        else {
            res.status(404).json({ error: 'Vehicle not found' });
        }
    }
    catch (error) {
        if (isError(error)) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}));
// Delete a vehicle by ID
VehicleRouter.delete('/vehicles/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const vehicle = yield vehicle_1.default.findByPk(id);
        if (vehicle) {
            yield vehicle.destroy();
            res.status(204).end();
        }
        else {
            res.status(404).json({ error: 'Vehicle not found' });
        }
    }
    catch (error) {
        if (isError(error)) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}));
exports.default = VehicleRouter;
