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
const driverearnings_1 = __importDefault(require("../db/models/driverearnings"));
const driverEarningsRouter = express_1.default.Router();
// Middleware to parse JSON bodies
driverEarningsRouter.use(express_1.default.json());
// Create a new driver earnings record
driverEarningsRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driver_id, request_id, earnings } = req.body;
        if (!driver_id || !request_id || !earnings) {
            return res.status(400).send({ message: 'Please provide driver_id, request_id, and earnings.' });
        }
        // Convert earnings to a number if it's not already
        const earningsNumber = parseFloat(earnings);
        // Check if the conversion is successful
        if (isNaN(earningsNumber)) {
            return res.status(400).send({ message: 'Invalid earnings value.' });
        }
        const date = new Date();
        // Create a new driver earnings record
        const driverEarnings = yield driverearnings_1.default.create({
            driver_id,
            request_id,
            date,
            earnings: earningsNumber,
            daily_earnings: earningsNumber,
            monthly_earnings: earningsNumber
        });
        return res.status(201).send({ message: 'Driver earnings created successfully', data: driverEarnings });
    }
    catch (error) {
        console.error('Error in creating driver earnings:', error);
        return res.status(500).send({ message: `Error in creating driver earnings: ${error.message}` });
    }
}));
// driverEarningsRouter.post('/', async (req: Request, res: Response) => {
//     try {
//         const { driver_id, request_id, earnings } = req.body;
//         if (!driver_id || !request_id || !earnings) {
//             return res.status(400).send({ message: 'Please provide driver_id, request_id, and earnings.' });
//         }
//         const date = new Date();
//         const driverEarnings = await DriverEarnings.create({
//             driver_id,
//             request_id,
//             date,
//             earnings,
//             daily_earnings: earnings,
//             monthly_earnings: earnings
//         });
//         return res.status(201).send({ message: 'Driver earnings created successfully', data: driverEarnings });
//     } catch (error: any) {
//         console.error('Error in creating driver earnings:', error);
//         return res.status(500).send({ message: `Error in creating driver earnings: ${error.message}` });
//     }
// });
// Get all driver earnings records
driverEarningsRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driverEarnings = yield driverearnings_1.default.findAll();
        return res.status(200).send(driverEarnings);
    }
    catch (error) {
        console.error('Error in fetching driver earnings:', error);
        return res.status(500).send({ message: `Error in fetching driver earnings: ${error.message}` });
    }
}));
// Get a driver earnings record by ID
driverEarningsRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const driverEarnings = yield driverearnings_1.default.findByPk(id);
        if (!driverEarnings) {
            return res.status(404).send({ message: 'Driver earnings record not found.' });
        }
        return res.status(200).send(driverEarnings);
    }
    catch (error) {
        console.error('Error in fetching driver earnings by ID:', error);
        return res.status(500).send({ message: `Error in fetching driver earnings: ${error.message}` });
    }
}));
driverEarningsRouter.get('/driver/:driver_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driver_id } = req.params; // Use driver_id from request params
        const driverEarnings = yield driverearnings_1.default.findOne({
            where: { driver_id: driver_id }
        });
        if (!driverEarnings) {
            return res.status(404).send({ message: 'Driver earnings record not found.' });
        }
        return res.status(200).send(driverEarnings);
    }
    catch (error) {
        console.error('Error in fetching driver earnings by driver_id:', error);
        return res.status(500).send({ message: `Error in fetching driver earnings: ${error.message}` });
    }
}));
// Update a driver earnings record
driverEarningsRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { driver_id, request_id, earnings } = req.body;
        const driverEarnings = yield driverearnings_1.default.findByPk(id);
        if (!driverEarnings) {
            return res.status(404).send({ message: 'Driver earnings record not found.' });
        }
        const date = new Date();
        yield driverEarnings.update({ driver_id, request_id, date, earnings });
        return res.status(200).send({ message: 'Driver earnings updated successfully', data: driverEarnings });
    }
    catch (error) {
        console.error('Error in updating driver earnings:', error);
        return res.status(500).send({ message: `Error in updating driver earnings: ${error.message}` });
    }
}));
// Delete a driver earnings record
driverEarningsRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const driverEarnings = yield driverearnings_1.default.findByPk(id);
        if (!driverEarnings) {
            return res.status(404).send({ message: 'Driver earnings record not found.' });
        }
        yield driverEarnings.destroy();
        return res.status(200).send({ message: 'Driver earnings deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleting driver earnings:', error);
        return res.status(500).send({ message: `Error in deleting driver earnings: ${error.message}` });
    }
}));
exports.default = driverEarningsRouter;
