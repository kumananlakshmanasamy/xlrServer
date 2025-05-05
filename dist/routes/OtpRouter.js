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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = __importDefault(require("../db/models/users"));
dotenv_1.default.config();
const OTPRouter = express_1.default.Router();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const APP_ID = process.env.APP_ID;
const JWT_SECRET = process.env.JWT_SECRET; // Add this to your .env file
const service_id = 1;
if (!CLIENT_ID || !CLIENT_SECRET || !APP_ID || !JWT_SECRET) {
    throw new Error('CLIENT_ID, CLIENT_SECRET, APP_ID, or JWT_SECRET is not defined in environment variables');
}
// Generate and send OTP
OTPRouter.post('/send-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }
    // Sanitize and validate phone number
    const sanitizedPhone = phone.replace(/\D/g, '');
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }
    try {
        const response = yield axios_1.default.post('https://auth.otpless.app/auth/otp/v1/send', {
            phoneNumber: 91 + sanitizedPhone,
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
            res.json({ message: 'OTP sent successfully', orderId: response.data.orderId });
        }
        else {
            throw new Error(`Failed to send OTP: ${response.data.message || 'Unknown error'}`);
        }
    }
    catch (error) {
        console.error('Error sending OTP:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({
            error: `Failed to send OTP: ${((_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) || error.message}`
        });
    }
}));
// Verify OTP
// OTPRouter.post('/verify-otp', async (req: Request, res: Response) => {
//   const { phone, otp, orderId } = req.body;
//   if (!phone || !otp || !orderId) {
//     return res.status(400).json({ error: 'Phone number, OTP, and orderId are required' });
//   }
//   // Sanitize and validate phone number
//   const sanitizedPhone = phone.replace(/\D/g, '');
//   if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
//     return res.status(400).json({ error: 'Invalid phone number format' });
//   }
//   try {
//     const response = await axios.post('https://auth.otpless.app/auth/otp/v1/verify', {
//       phoneNumber: sanitizedPhone,
//       otp,
//       orderId
//     }, {
//       headers: {
//         'Content-Type': 'application/json',
//         'clientId': CLIENT_ID,
//         'clientSecret': CLIENT_SECRET,
//         'appId': APP_ID
//       }
//     });
//     console.log('OTP verify response:', response.data);
//     if (response.data.isOTPVerified) {
//       // Generate JWT token
//       const token = jwt.sign({ id:User.id,phone: sanitizedPhone }, JWT_SECRET, { expiresIn: '1h' });
//       console.log('JWT Token:', token); // Log the token
//       res.json({ message: 'OTP Verified Successfully!', token });
//     } else {
//       res.status(400).json({ error: 'Invalid OTP or phone number' });
//     }
//   } catch (error: any) {
//     console.error('Error verifying OTP:', error.response?.data || error.message);
//     res.status(error.response?.status || 500).json({
//       error: `Failed to verify OTP: ${error.response?.data?.message || error.message}`
//     });
//   }
// });
OTPRouter.post('/verify-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g, _h;
    const { phone, otp, orderId } = req.body;
    if (!phone || !otp || !orderId) {
        return res.status(400).json({ error: 'Phone number, OTP, and orderId are required' });
    }
    // Sanitize and validate phone number
    const sanitizedPhone = phone.replace(/\D/g, '');
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }
    try {
        const response = yield axios_1.default.post('https://auth.otpless.app/auth/otp/v1/verify', {
            phoneNumber: 91 + sanitizedPhone,
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
            // Fetch user by phone number
            const user = yield users_1.default.findOne({ where: { phone: sanitizedPhone } });
            if (user) {
                // Generate JWT token
                const token = jsonwebtoken_1.default.sign({ id: user.id, phone: sanitizedPhone, service_id }, // Include user ID in payload
                JWT_SECRET, { expiresIn: '12h' });
                console.log('JWT Token:', token); // Log the token
                res.json({ message: 'OTP Verified Successfully!', token });
            }
            else {
                res.status(404).json({ error: 'User not found' });
            }
        }
        else {
            res.status(400).json({ error: 'Invalid OTP or phone number' });
        }
    }
    catch (error) {
        console.error('Error verifying OTP:', ((_e = error.response) === null || _e === void 0 ? void 0 : _e.data) || error.message);
        res.status(((_f = error.response) === null || _f === void 0 ? void 0 : _f.status) || 500).json({
            error: `Failed to verify OTP: ${((_h = (_g = error.response) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.message) || error.message}`
        });
    }
}));
exports.default = OTPRouter;
