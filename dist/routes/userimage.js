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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const UsersRouter = express_1.default.Router();
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
// Create a new user with profile_image
UsersRouter.post("/", upload.single("profile_image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { firstname, lastname, email, phone, gender, password } = req.body;
        const profile_image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.location;
        // Validate required fields
        if (!firstname || !lastname || !email || !phone || !password) {
            return res.status(400).send({ message: "Please fill in all required fields." });
        }
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
        // Check if user with the same email already exists
        const existingUser = yield users_1.default.findOne({ where: { email, is_deleted: false } });
        if (existingUser) {
            return res.status(400).send({ message: "User with this email already exists." });
        }
        // Create user object
        const createUserObject = {
            username: `${firstname} ${lastname}`,
            email,
            phone,
            gender,
            password,
            profile_image,
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
// Get the profile image for a specific user
UsersRouter.get("/:user_id/profile_image", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        // Find the user by ID
        const user = yield users_1.default.findByPk(user_id, {
            attributes: ['profile_image'], // Only fetch the profile_image attribute
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
exports.default = UsersRouter;
