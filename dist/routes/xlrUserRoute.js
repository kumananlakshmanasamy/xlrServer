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
const xlrUser_1 = __importDefault(require("../db/models/xlrUser"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = __importDefault(require("../../src/redis/redis")); // adjust path if needed
dotenv_1.default.config();
const XlrUserRouter = express_1.default.Router();
// Create/Register new XlrUser
XlrUserRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullname, email, password, phone } = req.body;
        if (!fullname || !email || !password || !phone) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).send({ message: 'Invalid email format.' });
        }
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).send({ message: 'Phone number must be 10 digits.' });
        }
        const existingByEmail = yield xlrUser_1.default.findOne({ where: { email } });
        if (existingByEmail) {
            return res.status(400).send({ message: 'XlrUser with this email already exists.' });
        }
        const existingByPhone = yield xlrUser_1.default.findOne({ where: { phone } });
        if (existingByPhone) {
            return res.status(400).send({ message: 'XlrUser with this phone number already exists.' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = yield xlrUser_1.default.create({
            fullname,
            email,
            password: hashedPassword,
            phone,
        });
        return res.status(200).send({ message: 'XlrUser registered successfully', data: newUser });
    }
    catch (error) {
        console.error('Error registering XlrUser:', error);
        return res.status(500).send({ message: `Error: ${error.message}` });
    }
}));
// XlrUser Login
XlrUserRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }
        const user = yield xlrUser_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(400).send({ message: 'Invalid email or password.' });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send({ message: 'Invalid email or password.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).send({ message: 'Login successful', token });
    }
    catch (error) {
        console.error('Error logging in XlrUser:', error);
        return res.status(500).send({ message: `Error: ${error.message}` });
    }
}));
// Get XlrUser by ID with Redis Caching
XlrUserRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        redis_1.default.get(`XlrUser:${id}`, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error.' });
            }
            if (cachedData) {
                console.log('Cache hit: returning XlrUser from Redis');
                return res.status(200).send(JSON.parse(cachedData));
            }
            const user = yield xlrUser_1.default.findOne({ where: { id } });
            if (!user) {
                return res.status(404).send({ message: 'XlrUser not found.' });
            }
            yield redis_1.default.set(`XlrUser:${id}`, JSON.stringify(user));
            yield redis_1.default.expire(`XlrUser:${id}`, 60);
            return res.status(200).send(user);
        }));
    }
    catch (error) {
        console.error('Error fetching XlrUser:', error);
        return res.status(500).send({ message: `Error: ${error.message}` });
    }
}));
// Update Password
XlrUserRouter.put('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, newPassword } = req.body;
        if (!phone || !newPassword) {
            return res.status(400).send({ message: 'Phone and new password are required.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).send({ message: 'Password must be at least 6 characters.' });
        }
        const user = yield xlrUser_1.default.findOne({ where: { phone } });
        if (!user) {
            return res.status(404).send({ message: 'XlrUser not found.' });
        }
        const isSamePassword = yield bcrypt_1.default.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).send({ message: 'New password cannot be same as old password.' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield xlrUser_1.default.update({ password: hashedPassword }, { where: { phone } });
        return res.status(200).send({ message: 'Password updated successfully.' });
    }
    catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).send({ message: `Error: ${error.message}` });
    }
}));
exports.default = XlrUserRouter;
