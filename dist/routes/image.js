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
const product_1 = __importDefault(require("../db/models/product"));
const Category_1 = __importDefault(require("../db/models/Category"));
const SubCategory_1 = __importDefault(require("../db/models/SubCategory"));
const brand_1 = __importDefault(require("../db/models/brand"));
const restaurant_1 = __importDefault(require("../db/models/restaurant"));
dotenv_1.default.config();
const ImageRouter = express_1.default.Router();
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
            cb(null, `images/${Date.now()}_${file.originalname}`);
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
// Route to upload image
ImageRouter.post('/upload', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Request Fields:', req.body);
    console.log('Request File:', req.file);
    try {
        const file = req.file;
        const { entity_type, entity_id, alt_text } = req.body;
        if (!file || !entity_type || !entity_id) {
            return res.status(400).json({ success: false, error: 'All required fields are not provided' });
        }
        // Check if the entity exists based on entity_type
        if (entity_type === 'Category') {
            const categoryExists = yield Category_1.default.findByPk(entity_id);
            if (!categoryExists) {
                return res.status(404).json({ success: false, error: 'Category not found' });
            }
        }
        if (entity_type === 'SubCategory') {
            const subCategoryExists = yield SubCategory_1.default.findByPk(entity_id);
            if (!subCategoryExists) {
                return res.status(404).json({ success: false, error: 'SubCategory not found' });
            }
        }
        if (entity_type === 'product') {
            const productExists = yield product_1.default.findByPk(entity_id);
            if (!productExists) {
                return res.status(404).json({ success: false, error: 'Product not found' });
            }
        }
        if (entity_type === 'brand') {
            const brandExists = yield brand_1.default.findByPk(entity_id);
            if (!brandExists) {
                return res.status(404).json({ success: false, error: 'Brand not found' });
            }
        }
        if (entity_type === 'restaurant') {
            const restaurantExists = yield restaurant_1.default.findByPk(entity_id);
            if (!restaurantExists) {
                return res.status(404).json({ success: false, error: 'restaurant not found' });
            }
        }
        if (entity_type === 'dish') {
            const dishExists = yield brand_1.default.findByPk(entity_id);
            if (!dishExists) {
                return res.status(404).json({ success: false, error: 'dish not found' });
            }
        }
        if (entity_type === 'inventory') {
            const inventoryExists = yield brand_1.default.findByPk(entity_id);
            if (!inventoryExists) {
                return res.status(404).json({ success: false, error: 'inventory not found' });
            }
        }
        const image = yield image_1.default.create({
            entity_type,
            entity_id,
            image_url: file.location,
            alt_text: alt_text || '',
        });
        res.status(200).json({ success: true, data: image });
    }
    catch (err) {
        console.error('Error in /upload:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
}));
// Get an image by ID
ImageRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const image = yield image_1.default.findOne({ where: { image_id: id } });
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        res.status(200).json(image);
    }
    catch (error) {
        console.error('Error in fetching image by ID:', error);
        res.status(500).json({ message: `Error in fetching image: ${error.message}` });
    }
}));
// Get all images
ImageRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = yield image_1.default.findAll();
        res.status(200).json(images);
    }
    catch (error) {
        console.error('Error in fetching images:', error);
        res.status(500).json({ message: `Error in fetching images: ${error.message}` });
    }
}));
// Update an image
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
        console.error('Error in updating image:', error);
        res.status(500).json({ message: `Error in updating image: ${error.message}` });
    }
}));
// Delete an image
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
        console.error('Error in deleting image:', error);
        res.status(500).json({ message: `Error in deleting image: ${error.message}` });
    }
}));
exports.default = ImageRouter;
