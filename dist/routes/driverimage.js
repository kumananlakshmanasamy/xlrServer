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
const driver_1 = __importDefault(require("../db/models/driver")); // Import Driver model
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const redis_1 = __importDefault(require("../../src/redis/redis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DriversRouter = express_1.default.Router();
// Configure AWS S3
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
        key: (req, file, cb) => {
            cb(null, `driver_images/${Date.now()}_${file.originalname}`);
        },
    }),
});
// Create a new driver
DriversRouter.post("/", upload.single("profile_image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { first_name, last_name, email, password, vehicle_number, gender, dob, vehicle_type, phone } = req.body;
        const profile_image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.location;
        // Validate required fields
        if (!first_name || !last_name || !email || !password || !vehicle_number || !vehicle_type) {
            return res.status(400).send({ message: "Please fill in all required fields." });
        }
        // Validate email format
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).send({ message: "Please enter a valid email address." });
        }
        // Check if driver with the same email already exists and is active
        const existingDriver = yield driver_1.default.findOne({ where: { email, is_deleted: false } });
        if (existingDriver) {
            return res.status(400).send({ message: "Driver with this email already exists." });
        }
        // Create driver_name from first_name and last_name
        const driver_name = `${first_name} ${last_name}`;
        // Create driver object to be inserted
        const createDriverObject = {
            driver_name,
            email,
            password,
            gender,
            dob,
            vehicle_type,
            vehicle_number,
            phone,
            profile_image
        };
        console.log("Creating Driver with object:", createDriverObject);
        // Create driver using Sequelize model
        const createDriver = yield driver_1.default.create(createDriverObject);
        return res.status(200).send({ message: "Driver created successfully", data: createDriver });
    }
    catch (error) {
        console.error("Error in creating driver:", error);
        return res.status(500).send({ message: `Error in creating driver: ${error.message}` });
    }
}));
// Get the profile image for a specific driver
DriversRouter.get("/:driver_id/profile_image", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { driver_id } = req.params;
    const cacheKey = `driverProfileImage:${driver_id}`; // Define a cache key based on driver ID
    try {
        // Check if the profile image is already in Redis
        redis_1.default.get(cacheKey, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (cachedData) {
                // If data is found in Redis, parse and return it
                console.log('Cache hit, returning data from Redis');
                return res.status(200).json({ profile_image: JSON.parse(cachedData) });
            }
            // Fetch the profile image from the database
            const driver = yield driver_1.default.findByPk(driver_id, {
                attributes: ['profile_image'], // Only fetch the profile_image attribute
            });
            if (!driver) {
                return res.status(404).send({ message: "Driver not found." });
            }
            const profileImage = driver.profile_image;
            // Store the profile image in Redis with an expiration time of 2 seconds
            yield redis_1.default.set(cacheKey, JSON.stringify(profileImage));
            yield redis_1.default.expire(cacheKey, 2);
            // Respond with the profile image
            res.status(200).json({ profile_image: profileImage });
        }));
    }
    catch (error) {
        console.error("Error in retrieving profile image:", error);
        return res.status(500).send({ message: `Error in retrieving profile image: ${error.message}` });
    }
}));
// Route to update driver's profile image
DriversRouter.post("/:driver_id/profile_image", upload.single("profile_image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { driver_id } = req.params;
        const profile_image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.location;
        if (!profile_image) {
            return res.status(400).send({ message: "No profile image uploaded." });
        }
        // Find the driver by ID
        const driver = yield driver_1.default.findByPk(driver_id);
        if (!driver) {
            return res.status(404).send({ message: "Driver not found." });
        }
        // Update the driver's profile image
        driver.profile_image = profile_image;
        yield driver.save();
        return res.status(200).send({ message: "Profile image updated successfully", profile_image });
    }
    catch (error) {
        console.error("Error in updating profile image:", error);
        return res.status(500).send({ message: `Error in updating profile image: ${error.message}` });
    }
}));
// Route to patch driver's profile image
DriversRouter.patch("/:driver_id/profile-image", upload.single("profile_image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { driver_id } = req.params;
        const profile_image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.location;
        // Check if the image is provided
        if (!profile_image) {
            return res.status(400).send({ message: "Profile image is required." });
        }
        // Find the driver by ID
        const driver = yield driver_1.default.findByPk(driver_id);
        if (!driver) {
            return res.status(404).send({ message: "Driver not found." });
        }
        // Update only the profile image
        driver.profile_image = profile_image;
        // Save the updated driver to the database
        yield driver.save();
        return res.status(200).send({ message: "Profile image updated successfully", data: driver });
    }
    catch (error) {
        console.error("Error in updating profile image:", error);
        return res.status(500).send({ message: `Error in updating profile image: ${error.message}` });
    }
}));
exports.default = DriversRouter;
