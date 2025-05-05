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
const otpStorage = {};
DriverOTPRouter.post('/send-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }
    const sanitizedPhone = phone.replace(/\D/g, '');
    try {
        const response = yield axios_1.default.post('https://auth.otpless.app/auth/otp/v1/send', {
            phoneNumber: 91 + sanitizedPhone,
            otpLength: 4,
            channel: 'WHATSAPP',
            expiry: 600,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'clientId': CLIENT_ID,
                'clientSecret': CLIENT_SECRET,
                'appId': APP_ID,
            }
        });
        if (response.data.orderId) {
            // Store phone and orderId
            otpStorage[sanitizedPhone] = { phone: sanitizedPhone, orderId: response.data.orderId };
            res.json({ message: 'OTP sent successfully' });
        }
        else {
            throw new Error(`Failed to send OTP: ${response.data.message || 'Unknown error'}`);
        }
    }
    catch (error) {
        res.status(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500).json({
            error: `Failed to send OTP: ${((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || error.message}`,
        });
    }
}));
DriverOTPRouter.post('/verify-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f;
    const { otp } = req.body;
    // Assuming phone is known from the session or other storage
    const phone = Object.keys(otpStorage)[0]; // In production, use a better method to retrieve the correct phone number
    const { orderId } = otpStorage[phone];
    try {
        const response = yield axios_1.default.post('https://auth.otpless.app/auth/otp/v1/verify', {
            phoneNumber: 91 + phone,
            otp,
            orderId,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'clientId': CLIENT_ID,
                'clientSecret': CLIENT_SECRET,
                'appId': APP_ID,
            }
        });
        if (response.data.isOTPVerified) {
            const driver = yield driver_1.default.findOne({ where: { phone, is_deleted: false } });
            if (driver) {
                const token = jsonwebtoken_1.default.sign({ id: driver.id, phone }, JWT_SECRET, { expiresIn: '1h' });
                console.log('Generated JWT Token:', token); // Ensure this is in the correct scope
                // res.json({ message: 'OTP Verified Successfully!', token });
                res.json({ message: 'OTP Verified Successfully!', token });
            }
            else {
                res.status(404).json({ error: 'Driver not found or inactive' });
            }
        }
        else {
            res.status(400).json({ error: 'Invalid OTP' });
        }
    }
    catch (error) {
        res.status(((_d = error.response) === null || _d === void 0 ? void 0 : _d.status) || 500).json({
            error: `Failed to verify OTP: ${((_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.message) || error.message}`,
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
