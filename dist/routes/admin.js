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
const admin_1 = __importDefault(require("../db/models/admin"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const redis_1 = __importDefault(require("../redis/redis"));
require('dotenv').config();
const AdminRouter = express_1.default.Router();
const API_KEY = process.env.API_KEY;
const CLIENT_ID = process.env.CLIENT_ID; // Ensure your client ID is set in the environment variables
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Ensure your client secret is set in the environment variables
const APP_ID = process.env.APP_ID; // Ensure your app ID is set in the environment variables
dotenv_1.default.config();
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
            cb(null, `admin_image/${Date.now()}_${file.originalname}`);
        },
    }),
});
// Create a new admin with admin_image
AdminRouter.post('/', upload.single('admin_image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { admin_name, email, password, mobile_number } = req.body;
        const admin_image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.location; // Correctly access the file location
        // Validate required fields
        if (!admin_name || !email || !password || !mobile_number) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }
        // Validate email format
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).send({ message: 'Please enter a valid email address.' });
        }
        // Validate mobile number format
        if (!/^\d{10}$/.test(mobile_number)) {
            return res.status(400).send({ message: 'Please enter a valid 10-digit mobile number.' });
        }
        // Check if admin with the same email already exists
        const existingAdmin = yield admin_1.default.findOne({ where: { email } });
        if (existingAdmin) {
            return res.status(400).send({ message: 'Admin with this email already exists.' });
        }
        // Check if admin with the same mobile number already exists
        const existingAdminByMobile = yield admin_1.default.findOne({ where: { mobile_number } });
        if (existingAdminByMobile) {
            return res.status(400).send({ message: 'Admin with this mobile number already exists.' });
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create admin
        const createAdmin = yield admin_1.default.create({
            admin_name,
            email,
            password: hashedPassword,
            mobile_number,
            admin_image // Include the image URL in the creation
        });
        return res.status(200).send({ message: 'Admin created successfully', data: createAdmin });
    }
    catch (error) {
        console.error('Error in creating admin:', error);
        return res.status(500).send({ message: `Error in creating admin: ${error.message}` });
    }
}));
// Admin login
AdminRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }
        // Find admin by email
        const admin = yield admin_1.default.findOne({ where: { email } });
        if (!admin) {
            return res.status(400).send({ message: 'Invalid email or password.' });
        }
        // Compare passwords
        const isPasswordValid = yield bcrypt_1.default.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(400).send({ message: 'Invalid email or password.' });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: admin.admin_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).send({ message: 'Login successful', token });
    }
    catch (error) {
        console.error('Error in admin login:', error);
        return res.status(500).send({ message: `Error in admin login: ${error.message}` });
    }
}));
// Get admin by ID
AdminRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log(id);
        // Check if the admin details are already in Redis
        redis_1.default.get(`admin:${id}`, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error.' });
            }
            if (cachedData) {
                // If data is found in Redis, parse it and send the response
                console.log('Cache hit, returning data from Redis');
                return res.status(200).send(JSON.parse(cachedData));
            }
            // If data is not in Redis, fetch it from the database
            const admin = yield admin_1.default.findOne({ where: { admin_id: id } });
            if (!admin) {
                return res.status(404).send({ message: 'Admin not found.' });
            }
            // Store the admin details in Redis with an expiration time (e.g., 60 seconds)
            // redisClient.setex(`admin:${id}`, 60, JSON.stringify(admin), (redisErr) => {
            //   if (redisErr) {
            //     console.error('Error setting data in Redis:', redisErr);
            //   }
            // });
            yield redis_1.default.set(`admin:${id}`, JSON.stringify(admin));
            yield redis_1.default.expire(`admin:${id}`, 180);
            console.log(redis_1.default.get(`admin:${id}`));
            return res.status(200).send(admin);
        }));
    }
    catch (error) {
        console.error('Error in fetching admin by ID:', error);
        return res.status(500).send({ message: `Error in fetching admin: ${error.message}` });
    }
}));
// Get all admins
AdminRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield admin_1.default.findAll();
        return res.status(200).send(admins);
    }
    catch (error) {
        console.error('Error in fetching admins:', error);
        return res.status(500).send({ message: `Error in fetching admins: ${error.message}` });
    }
}));
// Update admin
AdminRouter.patch('/:id', upload.single('admin_image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { id } = req.params;
        const { admin_name, email, password, mobile_number } = req.body;
        const admin_image = (_b = req.file) === null || _b === void 0 ? void 0 : _b.location;
        const admin = yield admin_1.default.findOne({ where: { admin_id: id } });
        if (!admin) {
            return res.status(404).send({ message: 'Admin not found.' });
        }
        // Validate email format
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).send({ message: 'Please enter a valid email address.' });
        }
        // Validate mobile number format
        if (mobile_number && !/^\d{10}$/.test(mobile_number)) {
            return res.status(400).send({ message: 'Please enter a valid 10-digit mobile number.' });
        }
        // Check if admin with the same email already exists
        if (email && email !== admin.email) {
            const existingAdmin = yield admin_1.default.findOne({ where: { email } });
            if (existingAdmin) {
                return res.status(400).send({ message: 'Admin with this email already exists.' });
            }
        }
        // Check if admin with the same mobile number already exists
        if (mobile_number && mobile_number !== admin.mobile_number) {
            const existingAdminByMobile = yield admin_1.default.findOne({ where: { mobile_number } });
            if (existingAdminByMobile) {
                return res.status(400).send({ message: 'Admin with this mobile number already exists.' });
            }
        }
        // Hash new password if provided
        let updatedPassword = admin.password;
        if (password) {
            updatedPassword = yield bcrypt_1.default.hash(password, 10);
        }
        // Update admin
        const updateData = { admin_name, email, password: updatedPassword, mobile_number };
        if (admin_image) {
            updateData.admin_image = admin_image;
        }
        yield admin_1.default.update(updateData, { where: { admin_id: id } });
        return res.status(200).send({ message: 'Admin updated successfully' });
    }
    catch (error) {
        console.error('Error in updating admin:', error);
        return res.status(500).send({ message: `Error in updating admin: ${error.message}` });
    }
}));
// Delete (soft delete) admin
AdminRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const admin = yield admin_1.default.findOne({ where: { admin_id: id } });
        if (!admin) {
            return res.status(404).send({ message: 'Admin not found.' });
        }
        // Soft delete admin
        yield admin_1.default.destroy({ where: { admin_id: id } });
        return res.status(200).send({ message: 'Admin deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleting admin:', error);
        return res.status(500).send({ message: `Error in deleting admin: ${error.message}` });
    }
}));
// Delete (soft delete) admin
AdminRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const admin = yield admin_1.default.findOne({ where: { admin_id: id } });
        if (!admin) {
            return res.status(404).send({ message: 'Admin not found.' });
        }
        // Soft delete admin
        yield admin_1.default.destroy({ where: { admin_id: id } });
        return res.status(200).send({ message: 'Admin deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleting admin:', error);
        return res.status(500).send({ message: `Error in deleting admin: ${error.message}` });
    }
}));
/// Reset password
AdminRouter.patch('/reset-password/password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, newPassword } = req.body;
        console.log(req.body);
        // Validate required fields
        if (!email || !newPassword) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }
        // Find admin by email
        const admin = yield admin_1.default.findOne({ where: { email } });
        if (!admin) {
            return res.status(404).send({ message: 'Admin not found.' });
        }
        // Hash new password
        const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update admin password
        yield admin_1.default.update({ password: hashedNewPassword }, { where: { admin_id: admin.admin_id } });
        return res.status(200).send({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Error in resetting password:', error);
        return res.status(500).send({ message: `Error in resetting password:" ${error.message}` });
    }
}));
// // Check if email exists
// AdminRouter.post('/check-email', async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;
//     // Validate required fields
//     if (!email) {
//       return res.status(400).send({ message: 'Please fill in the email field.' });
//     }
//     // Find admin by email
//     const admin = await Admin.findOne({ where: { email } });
//     if (!admin) {
//       return res.status(404).send({ message: 'Admin not found.' });
//     }
//     // Send OTP using 2factor API
//     const response = await axios.post(`https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${admin.mobile_number}/AUTOGEN3`);
//     const { Details } = response.data;
//     // Save OTP session ID and timestamp
//     await Admin.update({ otp_session_id: Details, otp_timestamp: new Date() }, { where: { admin_id: admin.admin_id } });
//     return res.status(200).send({ message: 'OTP sent successfully.', email });
//   } catch (error: any) {
//     console.error('Error in checking email:', error);
//     return res.status(500).send({ message: `Error in checking email: ${error.message}` });
//   }
// });
// Send OTP
// AdminRouter.post('/send-otp', async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;
//    // Validate email
//     if (!email) {
//       return res.status(400).send({ message: 'Email is required.' });
//     }
//     // Check if admin with the email exists
//     const admin = await Admin.findOne({ where: { email } });
//     if (!admin) {
//       return res.status(404).send({ message: 'Admin not found.' });
//     }
//     // Send OTP
//     const response = await axios.get(`https://2factor.in/API/V1/${API_KEY}/SMS/${admin.mobile_number}/AUTOGEN3/OTP1`);
//     console.log(response)
//     if (response.data.Status !== 'Success') {
//       return res.status(500).send({ message: 'Failed to send OTP.' });
//     }
//     // Save session ID and timestamp
//     await Admin.update(
//       { otp_session_id: response.data.Details, otp_timestamp: new Date() },
//       { where: { email } }
//     );
//     return res.status(200).send({ message: 'OTP sent successfully.', sessionId: response.data.Details });
//   } catch (error: any) {
//     console.error('Error in sending OTP:', error);
//     return res.status(500).send({ message: `Error in sending OTP: ${error.message}` });
//   }
// });
// // Verify OTP
// AdminRouter.post('/verify-otp', async (req: Request, res: Response) => {
//   try {
//     const { email, otp } = req.body;
//     // Validate email and otp
//     if (!email || !otp) {
//       return res.status(400).send({ message: 'Email and OTP are required.' });
//     }
//     // Find admin by email
//     const admin = await Admin.findOne({ where: { email } });
//     if (!admin || !admin.otp_session_id || !admin.otp_timestamp) {
//       return res.status(400).send({ message: 'Invalid request.' });
//     }
//     // Check if OTP is within the valid time window (2 minutes)
//     const currentTime = new Date().getTime();
//     const otpTimestamp = new Date(admin.otp_timestamp).getTime();
//     const timeDifference = currentTime - otpTimestamp;
//     if (timeDifference > 2   60  1000) { // 2 minutes in milliseconds
//       return res.status(400).send({ message: 'OTP has expired.' });
//     }
//     // Verify OTP
//     const response = await axios.get(`https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY3/${admin.mobile_number}/${otp}`);
//     if (response.data.Status !== 'Success') {
//       return res.status(400).send({ message: 'Invalid OTP.' });
//     }
//     // Clear OTP session ID and timestamp on successful verification
//     await Admin.update(
//       { otp_session_id: null, otp_timestamp: null },
//       { where: { email } }
//     );
//     return res.status(200).send({ message: 'OTP verified successfully.' });
//   } catch (error: any) {
//     console.error('Error in verifying OTP:', error);
//     return res.status(500).send({ message: `Error in verifying OTP: ${error.message}` });
//   }
// });
//send-otp(whatsapp code)
AdminRouter.post('/send-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f;
    try {
        const { email } = req.body;
        console.log(email);
        // Validate email
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }
        // Check if admin with the email exists
        const admin = yield admin_1.default.findOne({ where: { email } });
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found.' });
        }
        // Send OTP
        const response = yield axios_1.default.post('https://auth.otpless.app/auth/otp/v1/send', {
            phoneNumber: 91 + admin.mobile_number,
            otpLength: 4,
            channel: 'WHATSAPP',
            expiry: 600
        }, {
            headers: {
                'Content-Type': 'application/json',
                'clientId': CLIENT_ID,
                'clientSecret': CLIENT_SECRET,
                'appId': APP_ID
            }
        });
        console.log('OTP send response:', response.data); // Log the full response for debugging
        if (response.data.orderId) { // Check if orderId is present
            // Save OTP orderId to database if needed
            yield admin_1.default.update({ otp_session_id: response.data.orderId, otp_timestamp: new Date() }, { where: { email } });
            res.json({ message: 'OTP sent successfully', orderId: response.data.orderId });
        }
        else {
            throw new Error(`Failed to send OTP: ${response.data.message || 'Unknown error'}`);
        }
    }
    catch (error) {
        console.error('Error sending OTP:', ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
        res.status(((_d = error.response) === null || _d === void 0 ? void 0 : _d.status) || 500).json({
            error: `Failed to send OTP: ${((_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.message) || error.message}`
        });
    }
}));
AdminRouter.post('/verify-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h, _j, _k;
    const { email, otp, orderId } = req.body;
    if (!email || !otp || !orderId) {
        return res.status(400).json({ error: 'Email, OTP, and orderId are required' });
    }
    try {
        // Check if admin with the email exists
        const admin = yield admin_1.default.findOne({ where: { email } });
        if (!admin || !admin.otp_session_id || !admin.otp_timestamp) {
            return res.status(400).json({ error: 'Invalid request. OTP was not sent or has expired.' });
        }
        // Check if OTP is within the valid time window (10 minutes)
        const currentTime = new Date().getTime();
        const otpTimestamp = new Date(admin.otp_timestamp).getTime();
        const timeDifference = currentTime - otpTimestamp;
        if (timeDifference > 10 * 60 * 1000) { // 10 minutes in milliseconds
            return res.status(400).json({ error: 'OTP has expired' });
        }
        // Verify OTP
        const response = yield axios_1.default.post('https://auth.otpless.app/auth/otp/v1/verify', {
            phoneNumber: '91' + admin.mobile_number,
            otp,
            orderId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'clientId': CLIENT_ID,
                'clientSecret': CLIENT_SECRET,
                'appId': APP_ID
            }
        });
        console.log('OTP verify response:', response.data);
        if (response.data.isOTPVerified) {
            // Clear OTP session ID and timestamp on successful verification
            yield admin_1.default.update({ otp_session_id: null, otp_timestamp: null }, { where: { email } });
            res.json({ message: 'OTP Verified Successfully!' });
        }
        else {
            res.status(400).json({ error: 'Invalid OTP or phone number' });
        }
    }
    catch (error) {
        console.error('Error verifying OTP:', ((_g = error.response) === null || _g === void 0 ? void 0 : _g.data) || error.message);
        res.status(((_h = error.response) === null || _h === void 0 ? void 0 : _h.status) || 500).json({
            error: `Failed to verify OTP: ${((_k = (_j = error.response) === null || _j === void 0 ? void 0 : _j.data) === null || _k === void 0 ? void 0 : _k.message) || error.message}`
        });
    }
    // Get admin by ID
    AdminRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const admin = yield admin_1.default.findOne({ where: { admin_id: id } });
            if (!admin) {
                return res.status(404).send({ message: 'Admin not found.' });
            }
            return res.status(200).send(admin);
        }
        catch (error) {
            console.error('Error in fetching admin by ID:', error);
            return res.status(500).send({ message: `Error in fetching admin: ${error.message}` });
        }
    }));
}));
exports.default = AdminRouter;
