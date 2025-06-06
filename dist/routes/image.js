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
const image_1 = __importDefault(require("../db/models/image"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = __importDefault(require("../../src/redis/redis"));
dotenv_1.default.config();
const ImageRouter = express_1.default.Router();
// AWS S3 Configuration
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.BUCKET_REGION || !process.env.BUCKET_NAME) {
    throw new Error('Missing AWS environment configuration');
}
const s3 = new client_s3_1.S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
// Multer-S3 Storage
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: process.env.BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `images/${Date.now()}_${file.originalname}`);
        },
    }),
});
// Middleware for multer errors
function multerErrorHandler(err, req, res, next) {
    if (err instanceof multer_1.default.MulterError) {
        return res.status(400).json({ success: false, error: `Multer Error: ${err.message}` });
    }
    next(err);
}
// ========================
// 📥 Upload an Image
// ========================
ImageRouter.post('/upload', upload.single('image'), multerErrorHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        const { alt_text } = req.body;
        if (!file) {
            return res.status(400).json({ success: false, error: 'Image file is required' });
        }
        const image = yield image_1.default.create({
            image_url: file.location,
            alt_text: alt_text || '',
        });
        res.status(201).json({ success: true, data: image });
    }
    catch (err) {
        console.error('Error uploading image:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
}));
// ========================
// 📄 Get Image by ID
// ========================
ImageRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const cacheKey = `image:${id}`;
    try {
        redis_1.default.get(cacheKey, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (cachedData) {
                console.log('Cache hit for image');
                return res.json(JSON.parse(cachedData));
            }
            const image = yield image_1.default.findOne({ where: { image_id: id } });
            if (!image) {
                return res.status(404).json({ message: 'Image not found' });
            }
            yield redis_1.default.set(cacheKey, JSON.stringify(image));
            yield redis_1.default.expire(cacheKey, 2); // Cache for 2 seconds
            res.status(200).json(image);
        }));
    }
    catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
}));
// ========================
// 📄 Get All Images
// ========================
ImageRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'all_images';
    try {
        redis_1.default.get(cacheKey, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (cachedData) {
                console.log('Cache hit for all images');
                return res.json(JSON.parse(cachedData));
            }
            const images = yield image_1.default.findAll();
            yield redis_1.default.set(cacheKey, JSON.stringify(images));
            yield redis_1.default.expire(cacheKey, 2); // Cache for 2 seconds
            res.status(200).json(images);
        }));
    }
    catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
}));
// ========================
// ✏️ Update Image Alt Text or URL
// ========================
ImageRouter.patch('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { image_url, alt_text } = req.body;
        const image = yield image_1.default.findOne({ where: { image_id: id } });
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        yield image.update({ image_url, alt_text });
        res.status(200).json({ message: 'Image updated successfully', data: image });
    }
    catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
}));
// ========================
// ❌ Delete Image
// ========================
ImageRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const image = yield image_1.default.findOne({ where: { image_id: id } });
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        yield image.destroy();
        res.status(200).json({ message: 'Image deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
}));
exports.default = ImageRouter;
