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
const riderequest_1 = __importDefault(require("../db/models/riderequest"));
const users_1 = __importDefault(require("../db/models/users"));
const driver_1 = __importDefault(require("../db/models/driver"));
const servicetype_1 = __importDefault(require("../db/models/servicetype"));
const booking_1 = __importDefault(require("../db/models/booking"));
const recieverdetails_1 = __importDefault(require("../db/models/recieverdetails"));
const RideRequestRouter = express_1.default.Router();
RideRequestRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, driver_id, service_type_id, receiver_id, booking_id, status } = req.body;
        // Check if user exists and is not deleted
        const user = yield users_1.default.findOne({ where: { id: user_id, is_deleted: false } });
        if (!user) {
            return res.status(404).send({ message: 'User not found or is deleted.' });
        }
        // Check if driver exists and is not deleted, only if driver_id is provided
        let driver = null;
        if (driver_id !== null && driver_id !== undefined) {
            driver = yield driver_1.default.findOne({ where: { driver_id, is_deleted: false } });
            if (!driver) {
                return res.status(404).send({ message: 'Driver not found or is deleted.' });
            }
        }
        // Check if service type exists
        const serviceType = yield servicetype_1.default.findOne({ where: { service_id: service_type_id } });
        if (!serviceType) {
            return res.status(404).send({ message: 'Service type not found.' });
        }
        // Check if receiver details exist
        const receiverDetails = yield recieverdetails_1.default.findOne({ where: { receiver_id } });
        if (!receiverDetails) {
            return res.status(404).send({ message: 'Receiver details not found.' });
        }
        // Check if booking exists
        const booking = yield booking_1.default.findOne({ where: { booking_id } });
        if (!booking) {
            return res.status(404).send({ message: 'Booking not found.' });
        }
        // Create ride request
        const createRideRequestObject = { user_id, driver_id, service_type_id, receiver_id, booking_id, status, is_deleted: false };
        const createRideRequest = yield riderequest_1.default.create(createRideRequestObject);
        return res.status(200).send({ message: 'Ride request created successfully', data: createRideRequest });
    }
    catch (error) {
        console.error('Error in creating ride request:', error);
        return res.status(500).send({ message: `Error in creating ride request: ${error.message}` });
    }
}));
//Get ride request by ID
RideRequestRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const rideRequest = yield riderequest_1.default.findOne({ where: { request_id: id, is_deleted: false } });
        if (!rideRequest) {
            return res.status(404).send({ message: 'Ride request not found.' });
        }
        return res.status(200).send({ data: rideRequest });
    }
    catch (error) {
        console.error('Error in getting ride request:', error);
        return res.status(500).send({ message: `Error in getting ride request: ${error.message}` });
    }
}));
// Update a ride request
RideRequestRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { user_id, driver_id, service_type_id, receiver_id, booking_id, status } = req.body;
        // Check if ride request exists
        const rideRequest = yield riderequest_1.default.findOne({ where: { request_id: id, is_deleted: false } });
        if (!rideRequest) {
            return res.status(404).send({ message: 'Ride request not found.' });
        }
        // Update ride request
        const updatedRideRequest = yield rideRequest.update({ user_id, driver_id, service_type_id, receiver_id, booking_id, status });
        return res.status(200).send({ message: 'Ride request updated successfully', data: updatedRideRequest });
    }
    catch (error) {
        console.error('Error in updating ride request:', error);
        return res.status(500).send({ message: `Error in updating ride request: ${error.message}` });
    }
}));
// Delete a ride request
RideRequestRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if ride request exists
        const rideRequest = yield riderequest_1.default.findOne({ where: { request_id: id, is_deleted: false } });
        if (!rideRequest) {
            return res.status(404).send({ message: 'Ride request not found.' });
        }
        // Delete ride request
        yield rideRequest.destroy();
        return res.status(200).send({ message: 'Ride request deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleting ride request:', error);
        return res.status(500).send({ message: `Error in deleting ride request: ${error.message}` });
    }
}));
// Get all ride requests
RideRequestRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rideRequests = yield riderequest_1.default.findAll({ where: { is_deleted: false } });
        return res.status(200).send({ data: rideRequests });
    }
    catch (error) {
        console.error('Error in getting all ride requests:', error);
        return res.status(500).send({ message: `Error in getting all ride requests: ${error.message}` });
    }
}));
RideRequestRouter.get('/ride-requests/completed', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const completedRideRequests = yield riderequest_1.default.findAll({
            where: { status: 'Completed', is_deleted: false },
            attributes: ['request_id', 'status'],
            include: [
                {
                    model: users_1.default,
                    attributes: ['username', 'phone'],
                },
                {
                    model: driver_1.default,
                    attributes: ['driver_name'],
                },
                {
                    model: booking_1.default,
                    attributes: ['booking_id', 'pickup_address', 'dropoff_address'],
                },
                {
                    model: recieverdetails_1.default,
                    attributes: ['receiver_id', 'receiver_name', 'receiver_phone_number']
                }
            ]
        });
        if (completedRideRequests.length === 0) {
            return res.status(404).json({ message: 'No completed ride requests found' });
        }
        res.json(completedRideRequests);
    }
    catch (error) {
        console.error('Error in fetching completed ride requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
RideRequestRouter.get('/driver/:driver_id/completed-orders', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driver_id } = req.params;
        const completedOrdersCount = yield riderequest_1.default.count({
            where: { driver_id, status: 'Completed', is_deleted: false }
        });
        return res.status(200).json({ completedOrdersCount });
    }
    catch (error) {
        console.error('Error in fetching completed orders count:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Route for fetching missed orders by driver ID
RideRequestRouter.get('/driver/:driver_id/missed-orders', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driver_id } = req.params;
        const MissedOrdersCount = yield riderequest_1.default.count({
            where: { driver_id, status: 'rejected', is_deleted: false }
        });
        return res.status(200).json({ MissedOrdersCount });
    }
    catch (error) {
        console.error('Error in fetching completed orders count:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Get orders for a specific user
RideRequestRouter.get('/user/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const getOrderDetails = yield riderequest_1.default.findAll({
            where: { user_id: Number(user_id), is_deleted: false },
            attributes: ['request_id', 'status'],
            include: [
                {
                    model: users_1.default,
                    attributes: ['id', 'username'],
                },
                {
                    model: driver_1.default,
                    attributes: ['driver_id', 'driver_name', 'vehicle_type'],
                },
                {
                    model: booking_1.default,
                    attributes: ['booking_id', 'pickup_address', 'dropoff_address', 'service_id'],
                },
            ]
        });
        if (getOrderDetails.length === 0) {
            return res.status(404).json({ message: 'No completed ride requests found' });
        }
        res.json(getOrderDetails);
    }
    catch (error) {
        console.error('Error in fetching completed ride requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
exports.default = RideRequestRouter;
