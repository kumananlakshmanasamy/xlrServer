"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
// Middleware to authenticate JWT token
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}
// Authentication middleware
const authMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    console.log("token is  ", token);
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded; // Attach decoded token to the request object
        next(); // Proceed to the next middleware or route handler
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};
exports.default = authMiddleware;
