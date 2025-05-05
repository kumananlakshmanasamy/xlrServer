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
const driver_documents_1 = __importDefault(require("../db/models/driver-documents"));
const driver_1 = __importDefault(require("../db/models/driver"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DriverDocsRouter = express_1.default.Router();
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
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driver_id, doc_type, doc_number, status } = req.body;
        const files = req.files;
        // Validate all required fields
        if (!driver_id || !doc_type || !files.front_image || !files.back_image || !doc_number) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }
        // Store document info in database
        const driverDocs = yield driver_documents_1.default.create({
            driver_id,
            doc_type,
            front_image: files.front_image[0].location,
            back_image: files.back_image[0].location,
            doc_number,
            status,
        });
        res.status(200).json({ success: true, data: driverDocs });
    }
    catch (err) {
        console.error('Error in /driverdocs:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
}));
// Get driver document by ID
DriverDocsRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const driverDoc = yield driver_documents_1.default.findOne({ where: { doc_id: id } });
        if (!driverDoc) {
            return res.status(404).send({ message: 'Driver document not found.' });
        }
        // Check if associated driver is not deleted
        const driver = yield driver_1.default.findOne({ where: { driver_id: driverDoc.driver_id, is_deleted: false } });
        if (!driver) {
            return res.status(404).send({ message: 'Associated driver not found or is deleted.' });
        }
        return res.status(200).send(driverDoc);
    }
    catch (error) {
        console.error('Error in fetching driver document by ID:', error);
        return res.status(500).send({ message: `Error in fetching driver document: ${error.message}` });
    }
}));
// Get all documents for a specific driver
DriverDocsRouter.get('/driver/:driver_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driver_id } = req.params;
        // Check if driver exists and is not deleted
        const driver = yield driver_1.default.findOne({ where: { driver_id, is_deleted: false } });
        if (!driver) {
            return res.status(404).send({ message: 'Driver not found or is deleted.' });
        }
        const driverDocs = yield driver_documents_1.default.findAll({ where: { driver_id } });
        return res.status(200).send(driverDocs);
    }
    catch (error) {
        console.error('Error in fetching driver documents:', error);
        return res.status(500).send({ message: `Error in fetching driver documents: ${error.message}` });
    }
}));
// Update driver document
DriverDocsRouter.patch('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { driver_id, doc_type, front_image, back_image, doc_number, status } = req.body;
        const driverDoc = yield driver_documents_1.default.findOne({ where: { doc_id: id } });
        if (!driverDoc) {
            return res.status(404).send({ message: 'Driver document not found.' });
        }
        // Check if associated driver is not deleted
        const driver = yield driver_1.default.findOne({ where: { driver_id: driverDoc.driver_id, is_deleted: false } });
        if (!driver) {
            return res.status(404).send({ message: 'Associated driver not found or is deleted.' });
        }
        // Update driver document
        const updateDriverDocsObject = { driver_id, doc_type, front_image, back_image, doc_number, status };
        yield driver_documents_1.default.update(updateDriverDocsObject, { where: { doc_id: id } });
        return res.status(200).send({ message: 'Driver document updated successfully' });
    }
    catch (error) {
        console.error('Error in updating driver document:', error);
        return res.status(500).send({ message: `Error in updating driver document: ${error.message}` });
    }
}));
// Accept document by driver_id
DriverDocsRouter.patch('/accept/:driverId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { driverId } = req.params;
    try {
        const document = yield driver_documents_1.default.findOne({ where: { driver_id: driverId } });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        document.status = true;
        yield document.save();
        res.json({ message: 'Document accepted successfully', document });
    }
    catch (error) {
        console.error('Error accepting document:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// Reject (delete) document by driver_id
DriverDocsRouter.delete('/:driverId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { driverId } = req.params;
    try {
        const document = yield driver_documents_1.default.findOne({ where: { driver_id: driverId } });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        yield document.destroy();
        res.json({ message: 'Document rejected and deleted successfully' });
    }
    catch (error) {
        console.error('Error rejecting document:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = DriverDocsRouter;
