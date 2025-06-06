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
const sender_details_1 = __importDefault(require("../db/models/sender_details"));
const redis_1 = __importDefault(require("../../src/redis/redis"));
const SenderDetailsRouter = express_1.default.Router();
// Create a new sender detail
SenderDetailsRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sender_name, mobile_number, user_id, address, address_type } = req.body;
        // Validate required fields
        if (!sender_name || !mobile_number || !user_id || !address || !address_type) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }
        // Validate address_type
        const validAddressTypes = ['Home', 'Shop', 'Other'];
        if (!validAddressTypes.includes(address_type)) {
            return res.status(400).send({ message: 'Invalid address type.' });
        }
        // Create sender detail
        const senderDetail = yield sender_details_1.default.create({
            sender_name,
            mobile_number,
            user_id,
            address,
            address_type,
        });
        return res.status(200).send({ message: 'Sender detail created successfully', data: senderDetail });
    }
    catch (error) {
        console.error('Error in creating sender detail:', error);
        return res.status(500).send({ message: `Error in creating sender detail: ${error.message}` });
    }
}));
// Get all sender details
SenderDetailsRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'senderDetails';
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
            const senderDetails = yield sender_details_1.default.findAll();
            yield redis_1.default.set(cacheKey, JSON.stringify(senderDetails));
            yield redis_1.default.expire(cacheKey, 2);
            res.status(200).send(senderDetails);
        }));
    }
    catch (error) {
        console.error('Error in fetching sender details:', error);
        res.status(500).send({ message: `Error in fetching sender details: ${error.message}` });
    }
}));
// Get a sender detail by ID
SenderDetailsRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const cacheKey = `senderDetail:${id}`;
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
            const senderDetail = yield sender_details_1.default.findOne({ where: { sender_id: id } });
            if (!senderDetail) {
                return res.status(404).send({ message: 'Sender detail not found.' });
            }
            yield redis_1.default.set(cacheKey, JSON.stringify(senderDetail));
            yield redis_1.default.expire(cacheKey, 2);
            res.status(200).send(senderDetail);
        }));
    }
    catch (error) {
        console.error('Error in fetching sender detail by ID:', error);
        res.status(500).send({ message: `Error in fetching sender detail: ${error.message}` });
    }
}));
// Update a sender detail
SenderDetailsRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { sender_name, mobile_number, user_id, address, address_type } = req.body;
        // Validate address_type
        const validAddressTypes = ['Home', 'Shop', 'Other'];
        if (address_type && !validAddressTypes.includes(address_type)) {
            return res.status(400).send({ message: 'Invalid address type.' });
        }
        const senderDetail = yield sender_details_1.default.findOne({ where: { sender_id: id } });
        if (!senderDetail) {
            return res.status(404).send({ message: 'Sender detail not found.' });
        }
        // Update sender detail
        yield sender_details_1.default.update({ sender_name, mobile_number, user_id, address, address_type }, { where: { sender_id: id } });
        return res.status(200).send({ message: 'Sender detail updated successfully' });
    }
    catch (error) {
        console.error('Error in updating sender detail:', error);
        return res.status(500).send({ message: `Error in updating sender detail: ${error.message}` });
    }
}));
// Delete (soft delete) a sender detail
SenderDetailsRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const senderDetail = yield sender_details_1.default.findOne({ where: { sender_id: id } });
        if (!senderDetail) {
            return res.status(404).send({ message: 'Sender detail not found.' });
        }
        yield sender_details_1.default.destroy({ where: { sender_id: id } });
        return res.status(200).send({ message: 'Sender detail deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleting sender detail:', error);
        return res.status(500).send({ message: `Error in deleting sender detail: ${error.message}` });
    }
}));
exports.default = SenderDetailsRouter;
