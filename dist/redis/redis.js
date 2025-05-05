"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const redis = new ioredis_1.default({
    host: '127.0.0.1',
    port: 6379,
    //   password: process.env.REDIS_PASSWORD || undefined, // Use undefined if not set
    //   db: Number(process.env.REDIS_DB) || 0,
});
redis.on('connect', () => {
    console.log('Connected to Redis');
});
redis.on('error', (error) => {
    console.error('Redis connection error:', error);
});
redis.on('end', () => {
    console.log('Redis connection closed');
});
redis.on('reconnecting', () => {
    console.log('Reconnecting to Redis');
});
exports.default = redis;
