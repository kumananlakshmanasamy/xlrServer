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
const express_1 = require("express");
const payment_1 = __importDefault(require("../db/models/payment"));
const payment_2 = require("../db/models/payment");
const paymentrouter = (0, express_1.Router)();
// Create a new payment
paymentrouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id, transaction_id, payment_status } = req.body;
        // Validate payment_status
        if (!Object.values(payment_2.PaymentStatus).includes(payment_status)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }
        const paymentData = {
            order_id,
            transaction_id,
            payment_status,
        };
        const newPayment = yield payment_1.default.create(paymentData);
        res.status(201).json(newPayment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating payment', error });
    }
}));
// Get all payments
paymentrouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield payment_1.default.findAll();
        res.status(200).json(payments);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving payments', error });
    }
}));
// Get a payment by ID
paymentrouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payment = yield payment_1.default.findByPk(req.params.id);
        if (payment) {
            res.status(200).json(payment);
        }
        else {
            res.status(404).json({ message: 'Payment not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving payment', error });
    }
}));
// Update a payment
paymentrouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id, transaction_id, payment_status } = req.body;
        const payment = yield payment_1.default.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        // Validate payment_status
        if (payment_status && !Object.values(payment_2.PaymentStatus).includes(payment_status)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }
        payment.order_id = order_id !== undefined ? order_id : payment.order_id;
        payment.transaction_id = transaction_id !== undefined ? transaction_id : payment.transaction_id;
        payment.payment_status = payment_status !== undefined ? payment_status : payment.payment_status;
        yield payment.save();
        res.status(200).json(payment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating payment', error });
    }
}));
// Delete a payment
paymentrouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payment = yield payment_1.default.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        yield payment.destroy();
        res.status(204).json({ message: 'Payment deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting payment', error });
    }
}));
exports.default = paymentrouter;
