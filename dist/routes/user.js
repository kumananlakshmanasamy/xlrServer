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
const users_1 = __importDefault(require("../db/models/users"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const redis_1 = __importDefault(require("../../src/redis/redis"));
const UserRouter = express_1.default.Router();
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
            cb(null, `user_images/${Date.now()}_${file.originalname}`);
        },
    }),
});
// Create a new user
UserRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstname, lastname, email, phone, gender, password } = req.body;
        // Validate required fields
        if (!firstname || !lastname || !email || !phone || !password) {
            return res.status(400).send({ message: "Please fill in all required fields." });
        }
        // Concatenate firstname and lastname to form username
        const username = `${firstname} ${lastname}`;
        // Validate email format
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).send({ message: "Please enter a valid email address." });
        }
        // Validate mobile number format
        if (!/^\d+$/.test(phone)) {
            return res.status(400).send({ message: "Please enter a valid mobile number." });
        }
        // Validate gender (optional)
        if (gender && !['M', 'F', 'Other'].includes(gender)) {
            return res.status(400).send({ message: "Please enter a valid gender." });
        }
        // Check if user with same email already exists and is active
        const existingUser = yield users_1.default.findOne({ where: { email, is_deleted: false } });
        if (existingUser) {
            return res.status(400).send({ message: "User with this email already exists." });
        }
        // Create user object to be inserted
        const createUserObject = {
            username,
            email,
            phone,
            gender,
            password, // Consider hashing for production
        };
        console.log("Creating User with object:", createUserObject);
        // Create user using Sequelize model 
        const createUser = yield users_1.default.create(createUserObject);
        return res.status(200).send({ message: "User created successfully", data: createUser });
    }
    catch (error) {
        console.error("Error in creating user:", error);
        return res.status(500).send({ message: `Error in creating user: ${error.message}` });
    }
}));
// Get user by ID
UserRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const cacheKey = `user:${id}`; // Define a cache key for the specific user
    console.log(`Received request for user with ID: ${id}`); // Log the received ID
    try {
        // Check if the user data is already in Redis
        redis_1.default.get(cacheKey, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error while fetching:', err); // Log Redis error
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (cachedData) {
                // If data is found in Redis, parse and return it
                console.log('Cache hit, returning data from Redis:', cachedData); // Log cached data
                return res.status(200).json(JSON.parse(cachedData));
            }
            // Cache miss, fetch user from the database
            console.log('Cache miss, fetching user from database...'); // Indicate cache miss
            const user = yield users_1.default.findOne({ where: { id, is_deleted: false } });
            if (!user) {
                console.log(`User not found for ID: ${id}`); // Log if user is not found
                return res.status(404).json({ message: 'User not found.' });
            }
            // Cache the user data in Redis with an expiration time of 2 seconds
            yield redis_1.default.set(cacheKey, JSON.stringify(user));
            const expireResult = yield redis_1.default.expire(cacheKey, 2);
            console.log(`User data cached for ID: ${id}, Expiration result: ${expireResult}`); // Log cache expiration result
            // Respond with the user data
            console.log(`Responding with user data for ID: ${id}`); // Log response
            res.status(200).json(user);
        }));
    }
    catch (error) {
        console.error('Error in fetching user by ID:', error); // Log the entire error object
        res.status(500).json({ message: `Error in fetching user: ${error.message}` });
    }
}));
// Get all users if is_deleted is false
UserRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'users'; // Define a cache key for all users
    try {
        // Check if the user data is already in Redis
        redis_1.default.get(cacheKey, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (cachedData) {
                // If data is found in Redis, parse and return it
                console.log('Cache hit, returning data from Redis');
                return res.status(200).json(JSON.parse(cachedData));
            }
            // Fetch the user data from the database
            const users = yield users_1.default.findAll({ where: { is_deleted: false } });
            // Store the user data in Redis with an expiration time of 2 seconds
            yield redis_1.default.set(cacheKey, JSON.stringify(users));
            yield redis_1.default.expire(cacheKey, 2);
            // Respond with the user data
            res.status(200).json(users);
        }));
    }
    catch (error) {
        console.error('Error in fetching users:', error);
        res.status(500).json({ message: `Error in fetching users: ${error.message}` });
    }
}));
// Update user
// UserRouter.patch("/:id", async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { firstname, lastname, email, mobile_number, gender, password } = req.body;
//     const user = await User.findOne({ where: { id, is_deleted: false } });
//     if (!user) {
//       return res.status(404).send({ message: "User not found." });
//     }
//     // Concatenate firstname and lastname to form username
//     const username = `${firstname} ${lastname}`;
//     // Update user object
//     const updateUserObject: any = {
//       username,
//       email,
//       mobile_number,
//       gender,
//       password
//     };
// Update user using Sequelize model
//     await User.update(updateUserObject, { where: { id } });
//     return res.status(200).send({ message: "User updated successfully" });
//   } catch (error: any) {
//     console.error("Error in updating user:", error);
//     return res.status(500).send({ message: `Error in updating user: ${error.message}` });
//   }
// });
UserRouter.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { username, email, phone, gender } = req.body;
        console.log("Update request body:", req.body); // Log the request body
        // Fetch user by id and check if not deleted
        const user = yield users_1.default.findOne({ where: { id, is_deleted: false } });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
        // Update user object
        const updateUserObject = {
            username,
            email,
            phone,
            gender,
        };
        // Update user using Sequelize model
        yield users_1.default.update(updateUserObject, { where: { id } });
        return res.status(200).send({ message: "User updated successfully" });
    }
    catch (error) {
        console.error("Error in updating user:", error);
        return res.status(500).send({ message: `Error in updating user: ${error.message}` });
    }
}));
// Soft delete user (set is_deleted to true)
UserRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield users_1.default.findOne({ where: { id, is_deleted: false } });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
        // Soft delete user
        yield users_1.default.update({ is_deleted: true }, { where: { id } });
        return res.status(200).send({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Error in deleting user:", error);
        return res.status(500).send({ message: `Error in deleting user: ${error.message}` });
    }
}));
// Get all users irrespective of active status
// UserRouter.get("/users/all", async (req: Request, res: Response) => {
//   try {
//     const users = await User.findAll();
//     return res.status(200).send(users);
//   } catch (error: any) {
//     console.error("Error in fetching all users:", error);
//     return res.status(500).send({ message: `Error in fetching all users: ${error.message}` });
//   }
// });
// Update user's active status
UserRouter.patch("/:id/active", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { active } = req.body;
        console.log(req.body, id);
        if (typeof active !== 'boolean') {
            return res.status(400).send({ message: "Please provide a valid active status." });
        }
        const user = yield users_1.default.findOne({ where: { id, is_deleted: false } });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
        yield users_1.default.update({ active }, { where: { id } });
        return res.status(200).send({ message: "User active status updated successfully" });
    }
    catch (error) {
        console.error("Error in updating user's active status:", error);
        return res.status(500).send({ message: `Error in updating user's active status: ${error.message}` });
    }
}));
UserRouter.get('/:id/counts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'activeUsersCount'; // Define a cache key for active users count
    try {
        // Check if the active users count is already in Redis
        redis_1.default.get(cacheKey, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (cachedData) {
                // If data is found in Redis, parse and return it
                console.log('Cache hit, returning data from Redis');
                return res.status(200).json({ count: JSON.parse(cachedData) });
            }
            // Fetch the active users count from the database
            const activeUsersCount = yield users_1.default.count({
                where: {
                    active: true,
                    is_deleted: false
                }
            });
            // Store the active users count in Redis with an expiration time of 2 seconds
            yield redis_1.default.set(cacheKey, JSON.stringify(activeUsersCount));
            yield redis_1.default.expire(cacheKey, 2);
            // Respond with the active users count
            res.status(200).json({ count: activeUsersCount });
        }));
    }
    catch (error) {
        console.error('Error fetching active users count:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
}));
UserRouter.get('/total/counts/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'totalUsersCount'; // Define a cache key for total users count
    try {
        // Check if the total users count is already in Redis
        redis_1.default.get(cacheKey, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (cachedData) {
                // If data is found in Redis, parse and return it
                console.log('Cache hit, returning data from Redis');
                return res.status(200).json({ count: JSON.parse(cachedData) });
            }
            // Fetch the total users count from the database
            const totalUsersCount = yield users_1.default.count();
            // Store the total users count in Redis with an expiration time of 2 seconds
            yield redis_1.default.set(cacheKey, JSON.stringify(totalUsersCount));
            yield redis_1.default.expire(cacheKey, 2);
            // Respond with the total users count
            res.status(200).json({ count: totalUsersCount });
        }));
    }
    catch (error) {
        console.error('Error fetching total users count:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
}));
UserRouter.patch("/:user_id/profile-image", upload.single("profile_image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { user_id } = req.params;
        const profile_image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.location;
        // Check if the image is provided
        if (!profile_image) {
            return res.status(400).send({ message: "Profile image is required." });
        }
        // Find the user by ID
        const user = yield users_1.default.findByPk(user_id);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
        // Update only the profile image
        user.profile_image = profile_image;
        // Save the updated user to the database
        yield user.save();
        return res.status(200).send({ message: "Profile image updated successfully", data: user });
    }
    catch (error) {
        console.error("Error in updating profile image:", error);
        return res.status(500).send({ message: `Error in updating profile image: ${error.message}` });
    }
}));
UserRouter.get("/:user_id/profile_image", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    const cacheKey = `userProfileImage:${user_id}`; // Define a cache key based on user ID
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
            const user = yield users_1.default.findByPk(user_id, {
                attributes: ['profile_image'],
            });
            if (!user) {
                return res.status(404).send({ message: "User not found." });
            }
            const profileImage = user.profile_image;
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
exports.default = UserRouter;
