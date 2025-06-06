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
const recieverdetails_1 = __importDefault(require("../db/models/recieverdetails"));
const redis_1 = __importDefault(require("../../src/redis/redis"));
const ReceiverDetailsRouter = express_1.default.Router();
// Create a new receiver detail
ReceiverDetailsRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receiver_name, receiver_phone_number, user_id, address, address_type } = req.body;
        // Validate required fields
        if (!receiver_name || !receiver_phone_number || !user_id || !address || !address_type) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }
        // Validate address_type
        const validAddressTypes = ['Home', 'Shop', 'Other'];
        if (!validAddressTypes.includes(address_type)) {
            return res.status(400).send({ message: 'Invalid address type.' });
        }
        // Create receiver detail
        const receiverDetail = yield recieverdetails_1.default.create({
            receiver_name,
            receiver_phone_number,
            user_id,
            address,
            address_type,
        });
        return res.status(200).send({ message: 'Receiver detail created successfully', data: receiverDetail });
    }
    catch (error) {
        console.error('Error in creating receiver detail:', error);
        return res.status(500).send({ message: `Error in creating receiver detail: ${error.message}` });
    }
}));
// Get all receiver details
ReceiverDetailsRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'receiverDetails';
    try {
        redis_1.default.get(cacheKey, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error' });
            }
            if (cachedData) {
                console.log('Cache hit, returning data from Redis');
                return res.status(200).send(JSON.parse(cachedData));
            }
            const receiverDetails = yield recieverdetails_1.default.findAll();
            yield redis_1.default.set(cacheKey, JSON.stringify(receiverDetails));
            yield redis_1.default.expire(cacheKey, 2);
            res.status(200).send(receiverDetails);
        }));
    }
    catch (error) {
        console.error('Error in fetching receiver details:', error);
        res.status(500).send({ message: `Error in fetching receiver details: ${error.message}` });
    }
}));
// Get a receiver detail by ID
ReceiverDetailsRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const cacheKey = `receiverDetail:${id}`;
    try {
        redis_1.default.get(cacheKey, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error' });
            }
            if (cachedData) {
                console.log('Cache hit, returning data from Redis');
                return res.status(200).send(JSON.parse(cachedData));
            }
            const receiverDetail = yield recieverdetails_1.default.findOne({ where: { receiver_id: id } });
            if (!receiverDetail) {
                return res.status(404).send({ message: 'Receiver detail not found.' });
            }
            yield redis_1.default.set(cacheKey, JSON.stringify(receiverDetail));
            yield redis_1.default.expire(cacheKey, 2);
            res.status(200).send(receiverDetail);
        }));
    }
    catch (error) {
        console.error('Error in fetching receiver detail by ID:', error);
        res.status(500).send({ message: `Error in fetching receiver detail: ${error.message}` });
    }
}));
// Update a receiver detail
ReceiverDetailsRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { receiver_name, receiver_phone_number, user_id, address, address_type } = req.body;
        // Validate address_type
        const validAddressTypes = ['Home', 'Shop', 'Other'];
        if (address_type && !validAddressTypes.includes(address_type)) {
            return res.status(400).send({ message: 'Invalid address type.' });
        }
        const receiverDetail = yield recieverdetails_1.default.findOne({ where: { receiver_id: id } });
        if (!receiverDetail) {
            return res.status(404).send({ message: 'Receiver detail not found.' });
        }
        // Update receiver detail
        yield recieverdetails_1.default.update({ receiver_name, receiver_phone_number, user_id, address, address_type }, { where: { receiver_id: id } });
        return res.status(200).send({ message: 'Receiver detail updated successfully' });
    }
    catch (error) {
        console.error('Error in updating receiver detail:', error);
        return res.status(500).send({ message: `Error in updating receiver detail: ${error.message}` });
    }
}));
// Delete (soft delete) a receiver detail
ReceiverDetailsRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const receiverDetail = yield recieverdetails_1.default.findOne({ where: { receiver_id: id } });
        if (!receiverDetail) {
            return res.status(404).send({ message: 'Receiver detail not found.' });
        }
        yield recieverdetails_1.default.destroy({ where: { receiver_id: id } });
        return res.status(200).send({ message: 'Receiver detail deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleting receiver detail:', error);
        return res.status(500).send({ message: `Error in deleting receiver detail: ${error.message}` });
    }
}));
exports.default = ReceiverDetailsRouter;
