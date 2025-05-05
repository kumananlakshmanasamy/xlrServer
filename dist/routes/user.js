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
            password
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
UserRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield users_1.default.findOne({ where: { id, is_deleted: false } });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
        return res.status(200).send(user);
    }
    catch (error) {
        console.error("Error in fetching user by ID:", error);
        return res.status(500).send({ message: `Error in fetching user: ${error.message}` });
    }
}));
// Get all users if is_deleted is false
UserRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield users_1.default.findAll({ where: { is_deleted: false } });
        return res.status(200).send(users);
    }
    catch (error) {
        console.error("Error in fetching users:", error);
        return res.status(500).send({ message: `Error in fetching users: ${error.message}` });
    }
}));
// Update user
UserRouter.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { firstname, lastname, email, mobile_number, gender, password } = req.body;
        const user = yield users_1.default.findOne({ where: { id, is_deleted: false } });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
        // Concatenate firstname and lastname to form username
        const username = `${firstname} ${lastname}`;
        // Update user object
        const updateUserObject = {
            username,
            email,
            mobile_number,
            gender,
            password
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
    try {
        const activeUsersCount = yield users_1.default.count({
            where: {
                active: true,
                is_deleted: false
            }
        });
        res.json({ count: activeUsersCount });
    }
    catch (error) {
        console.error('Error fetching active drivers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
UserRouter.get('/total/counts/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalUsersCount = yield users_1.default.count();
        res.json({ count: totalUsersCount });
    }
    catch (error) {
        console.error('Error fetching total users count:', error);
        res.status(500).json({ message: 'Server Error' });
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
    try {
        const { user_id } = req.params;
        // Find the user by ID
        const user = yield users_1.default.findByPk(user_id, {
            attributes: ['profile_image'],
        });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
        return res.status(200).send({ profile_image: user.profile_image });
    }
    catch (error) {
        console.error("Error in retrieving profile image:", error);
        return res.status(500).send({ message: `Error in retrieving profile image: ${error.message}` });
    }
}));
exports.default = UserRouter;
