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
const booking_1 = __importDefault(require("../db/models/booking"));
const bookingRouter = express_1.default.Router();
// Create a new booking
bookingRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, service_id, pickup_address, dropoff_address } = req.body;
        // Validate required fields
        if (!user_id || !service_id || !pickup_address || !dropoff_address) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }
        // Create booking
        const booking = yield booking_1.default.create({ user_id, service_id, pickup_address, dropoff_address });
        return res.status(200).send({ message: 'Booking created successfully', data: booking });
    }
    catch (error) {
        console.error('Error in creating booking:', error);
        return res.status(500).send({ message: `Error in creating booking: ${error.message}` });
    }
}));
// Get all bookings
bookingRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield booking_1.default.findAll();
        return res.status(200).send(bookings);
    }
    catch (error) {
        console.error('Error in fetching bookings:', error);
        return res.status(500).send({ message: `Error in fetching bookings: ${error.message}` });
    }
}));
// Get a booking by ID
bookingRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const booking = yield booking_1.default.findOne({
            where: { booking_id: id }
        });
        if (!booking) {
            return res.status(404).send({ message: 'Booking not found.' });
        }
        return res.status(200).send(booking);
    }
    catch (error) {
        console.error('Error in fetching booking by ID:', error);
        return res.status(500).send({ message: `Error in fetching booking: ${error.message}` });
    }
}));
// Update a booking
bookingRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { user_id, service_id, pickup_address, dropoff_address } = req.body;
        const booking = yield booking_1.default.findOne({
            where: { booking_id: id }
        });
        if (!booking) {
            return res.status(404).send({ message: 'Booking not found.' });
        }
        // Update booking
        yield booking_1.default.update({ user_id, service_id, pickup_address, dropoff_address }, {
            where: { booking_id: id }
        });
        return res.status(200).send({ message: 'Booking updated successfully' });
    }
    catch (error) {
        console.error('Error in updating booking:', error);
        return res.status(500).send({ message: `Error in updating booking: ${error.message}` });
    }
}));
// Delete a booking
bookingRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const booking = yield booking_1.default.findOne({
            where: { booking_id: id }
        });
        if (!booking) {
            return res.status(404).send({ message: 'Booking not found.' });
        }
        // Delete booking
        yield booking_1.default.destroy({
            where: { booking_id: id }
        });
        return res.status(200).send({ message: 'Booking deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleting booking:', error);
        return res.status(500).send({ message: `Error in deleting booking: ${error.message}` });
    }
}));
exports.default = bookingRouter;
