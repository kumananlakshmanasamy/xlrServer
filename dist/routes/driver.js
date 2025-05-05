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
const DriverRouter = express_1.default.Router();
// Create a new driver
DriverRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { first_name, last_name, email, password, vehicle_number, gender, dob, vehicle_type, phone } = req.body;
        // Validate required fields
        if (!first_name || !last_name || !email || !password || !vehicle_number || !vehicle_type) {
            return res.status(400).send({ message: "Please fill in all required fields." });
        }
        // Validate email format                                                        
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).send({ message: "Please enter a valid email address." });
        }
        // Check if driver with same email already exists and is active
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
            phone
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
// Get driver by ID
DriverRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const driver = yield driver_1.default.findOne({ where: { driver_id: id, is_deleted: false } });
        if (!driver) {
            return res.status(404).send({ message: "Driver not found." });
        }
        return res.status(200).send(driver);
    }
    catch (error) {
        console.error("Error in fetching driver by ID:", error);
        return res.status(500).send({ message: `Error in fetching driver: ${error.message}` });
    }
}));
// Get all drivers
DriverRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const drivers = yield driver_1.default.findAll({ where: { is_deleted: false } });
        return res.status(200).send(drivers);
    }
    catch (error) {
        console.error("Error in fetching drivers:", error);
        return res.status(500).send({ message: `Error in fetching drivers: ${error.message}` });
    }
}));
// Update driver
DriverRouter.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, password, vehicle_number, gender, dob, vehicle_type, active, phone } = req.body;
        const driver = yield driver_1.default.findOne({ where: { driver_id: id, is_deleted: false } });
        if (!driver) {
            return res.status(404).send({ message: "Driver not found." });
        }
        // Create driver_name from first_name and last_name
        const driver_name = `${first_name} ${last_name}`;
        // Update driver object
        const updateDriverObject = {
            driver_name,
            email,
            password,
            gender,
            dob,
            vehicle_type,
            vehicle_number,
            active,
            phone
        };
        // Update driver using Sequelize model
        yield driver_1.default.update(updateDriverObject, { where: { driver_id: id } });
        return res.status(200).send({ message: "Driver updated successfully" });
    }
    catch (error) {
        console.error("Error in updating driver:", error);
        return res.status(500).send({ message: `Error in updating driver: ${error.message}` });
    }
}));
// Soft delete driver (set is_deleted to true)
DriverRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const driver = yield driver_1.default.findOne({ where: { driver_id: id, is_deleted: false } });
        if (!driver) {
            return res.status(404).send({ message: "Driver not found." });
        }
        // Soft delete driver
        yield driver_1.default.update({ is_deleted: true }, { where: { driver_id: id } });
        return res.status(200).send({ message: "Driver deleted successfully" });
    }
    catch (error) {
        console.error("Error in deleting driver:", error);
        return res.status(500).send({ message: `Error in deleting driver: ${error.message}` });
    }
}));
// Update driver's active status
DriverRouter.patch("/:id/active", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { active } = req.body;
        if (typeof active !== 'boolean') {
            return res.status(400).send({ message: "Please provide a valid active status." });
        }
        const driver = yield driver_1.default.findOne({ where: { driver_id: id, is_deleted: false } });
        if (!driver) {
            return res.status(404).send({ message: "Driver not found." });
        }
        yield driver_1.default.update({ active }, { where: { driver_id: id } });
        return res.status(200).send({ message: "Driver active status updated successfully" });
    }
    catch (error) {
        console.error("Error in updating driver's active status:", error);
        return res.status(500).send({ message: `Error in updating driver's active status: ${error.message}` });
    }
}));
DriverRouter.get('/:id/count', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log()
        const activeDriversCount = yield driver_1.default.count({
            where: {
                active: true,
                is_deleted: false
            }
        });
        res.json({ count: activeDriversCount });
    }
    catch (error) {
        console.error('Error fetching active drivers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
// Get total count of all drivers (including active, inactive, and soft-deleted)
DriverRouter.get('/total/count/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalDriversCount = yield driver_1.default.count();
        res.json({ count: totalDriversCount });
    }
    catch (error) {
        console.error('Error fetching total drivers count:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
exports.default = DriverRouter;
