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
const driver_1 = __importDefault(require("../db/models/driver"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const DriverOTPRouter = express_1.default.Router();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const APP_ID = process.env.APP_ID;
const JWT_SECRET = process.env.JWT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET || !APP_ID || !JWT_SECRET) {
    throw new Error('CLIENT_ID, CLIENT_SECRET, APP_ID, or JWT_SECRET is not defined in environment variables');
}
// Temporary storage for demonstration purposes
DriverOTPRouter.post('/send-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { phone } = req.body;
        // Validate phone number
        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        const sanitizedPhone = phone.replace(/\D/g, ''); // Remove non-digit characters
        if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }
        // Check if the driver exists in the database
        const driver = yield driver_1.default.findOne({ where: { phone: sanitizedPhone } });
        if (!driver) {
            // If the driver does not exist, it means a new driver, send OTP
            const otpResponse = yield axios_1.default.post('https://auth.otpless.app/auth/otp/v1/send', {
                phoneNumber: `91${sanitizedPhone}`,
                otpLength: 4,
                channel: 'SMS',
                expiry: 600, // OTP expiry in seconds (10 minutes)
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    appId: APP_ID,
                },
            });
            console.log('OTP send response:', otpResponse.data);
            if (otpResponse.data.orderId) {
                return res.json({ message: 'OTP sent successfully', orderId: otpResponse.data.orderId });
            }
            else {
                throw new Error(`OTP service error: ${otpResponse.data.message || 'Unknown error'}`);
            }
        }
        // If the driver exists, check their status
        if (!driver.active) {
            return res.status(403).json({ error: 'Driver is inactive.' });
        }
        // Send OTP via external service
        const otpResponse = yield axios_1.default.post('https://auth.otpless.app/auth/otp/v1/send', {
            phoneNumber: `91${sanitizedPhone}`, // Prefix with country code
            otpLength: 4,
            channel: 'SMS',
            expiry: 600, // OTP expiry in seconds (10 minutes)
        }, {
            headers: {
                'Content-Type': 'application/json',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                appId: APP_ID,
            },
        });
        console.log('OTP send response:', otpResponse.data);
        if (otpResponse.data.orderId) {
            // Optionally save orderId to DB for future reference
            res.json({ message: 'OTP sent successfully', orderId: otpResponse.data.orderId });
        }
        else {
            throw new Error(`OTP service error: ${otpResponse.data.message || 'Unknown error'}`);
        }
    }
    catch (error) {
        console.error('Error sending OTP:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({
            error: `Failed to send OTP: ${((_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) || error.message}`,
        });
    }
}));
DriverOTPRouter.post('/verify-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { phone, otp, orderId } = req.body;
    if (!phone || !otp || !orderId) {
        return res.status(400).json({ error: 'Phone number, OTP, and orderId are required' });
    }
    const sanitizedPhone = phone.replace(/\D/g, '');
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }
    try {
        const response = yield axios_1.default.post('https://auth.otpless.app/auth/otp/v1/verify', {
            phoneNumber: `91${sanitizedPhone}`,
            otp,
            orderId,
        }, {
            headers: {
                'Content-Type': 'application/json',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                appId: APP_ID,
            }
        });
        if (response.data.isOTPVerified) {
            const driver = yield driver_1.default.findOne({ where: { phone: sanitizedPhone } });
            if (driver) {
                const driverData = {
                    driverId: driver.driver_id,
                    phone: sanitizedPhone,
                    document_status: driver.document_status,
                };
                // Check document status
                switch (driver.document_status) {
                    case 'pending':
                        return res.status(200).json(Object.assign({ message: 'Documents are pending. Please upload your documents.' }, driverData));
                    case 'under_verification':
                        return res.status(200).json(Object.assign({ message: 'Documents are under verification.' }, driverData));
                    case 'approved':
                        const token = jsonwebtoken_1.default.sign({ id: driver.driver_id, phone: sanitizedPhone }, JWT_SECRET, { expiresIn: '12h' });
                        console.log('JWT Token:', token);
                        return res.json(Object.assign({ message: 'OTP Verified Successfully!', token }, driverData));
                    default:
                        return res.status(400).json({ message: 'Invalid document status.' });
                }
            }
            else {
                return res.status(404).json({ error: 'Driver not found' });
            }
        }
        else {
            return res.status(400).json({ error: 'Invalid OTP or phone number' });
        }
    }
    catch (error) {
        console.error('Error verifying OTP:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({
            error: `Failed to verify OTP: ${((_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) || error.message}`,
        });
    }
}));
DriverOTPRouter.get('/check-driver', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const phone = req.query.phone; // Ensure phoneNumber is treated as a string
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }
    try {
        const driver = yield driver_1.default.findOne({ where: { phone: phone, is_deleted: false } });
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found or inactive' });
        }
        res.json(driver);
    }
    catch (error) {
        console.error('Error fetching driver details:', error);
        res.status(500).json({ error: 'Failed to fetch driver details' });
    }
}));
exports.default = DriverOTPRouter;
