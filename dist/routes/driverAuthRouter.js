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
const express_1 = require("express");
const driver_1 = __importDefault(require("../db/models/driver")); // Adjust path as needed
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const driverAuthRouter = (0, express_1.Router)();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const APP_ID = process.env.APP_ID;
const JWT_SECRET = process.env.jwtsecretkey || 'default_secret'; // Fallback to 'default_secret' if not set
if (!CLIENT_ID || !CLIENT_SECRET || !APP_ID || !JWT_SECRET) {
    throw new Error('CLIENT_ID, CLIENT_SECRET, APP_ID, or JWT_SECRET is not defined in environment variables');
}
// Verify OTP and login driver
driverAuthRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { phone, otp, orderId } = req.body;
        if (!phone || !otp || !orderId) {
            return res.status(400).json({ error: 'Phone number, OTP, and orderId are required' });
        }
        // Sanitize and validate phone number
        const sanitizedPhone = phone.replace(/\D/g, '');
        if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }
        // Verify OTP using external API
        const response = yield axios_1.default.post('https://auth.otpless.app/auth/otp/v1/verify', {
            phoneNumber: sanitizedPhone,
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
            // Fetch driver by phone number
            const driver = yield driver_1.default.findOne({ where: { phone: sanitizedPhone, is_deleted: false } });
            if (driver) {
                // Generate JWT token
                const token = jsonwebtoken_1.default.sign({ id: driver.driver_id, phone: sanitizedPhone, name: driver.driver_name }, JWT_SECRET, { expiresIn: '24h' });
                console.log('JWT Token:', token); // Log the token
                return res.json({ message: 'OTP Verified Successfully!', token });
            }
            else {
                return res.status(404).json({ error: 'Driver not found or inactive' });
            }
        }
        else {
            return res.status(400).json({ error: 'Invalid OTP or phone number' });
        }
    }
    catch (error) {
        console.error('Error verifying OTP:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({
            error: `Failed to verify OTP: ${((_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) || error.message}`
        });
    }
}));
exports.default = driverAuthRouter;
