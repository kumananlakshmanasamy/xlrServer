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
const Address_1 = __importDefault(require("../db/models/Address"));
const redis_1 = __importDefault(require("../../src/redis/redis"));
const AddressRouter = express_1.default.Router();
AddressRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { house_number, apartment, landmark, type, user_id, city, state, zipcode, country, alternative_phone_number } = req.body;
        if (!house_number || !type || !user_id) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }
        const newAddress = yield Address_1.default.create({
            house_number,
            apartment,
            landmark,
            type,
            user_id,
            city,
            state,
            zipcode,
            country,
            alternative_phone_number
        });
        return res.status(201).send({ message: 'Address created successfully', address: newAddress });
    }
    catch (error) {
        console.error('Error creating address:', error);
        return res.status(500).send({ message: `Error creating address: ${error.message}` });
    }
}));
// Route to update an existing address
AddressRouter.patch('/update/:address_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address_id } = req.params;
        const { house_number, apartment, landmark, type, user_id, city, state, zipcode, country, alternative_phone_number } = req.body;
        // Find address by ID
        const address = yield Address_1.default.findByPk(address_id);
        if (!address) {
            return res.status(404).send({ message: 'Address not found.' });
        }
        // Update address details
        yield address.update({
            house_number,
            apartment,
            landmark,
            type,
            user_id,
            city,
            state,
            zipcode,
            country,
            alternative_phone_number
        });
        return res.status(200).send({ message: 'Address updated successfully', address });
    }
    catch (error) {
        console.error('Error updating address:', error);
        return res.status(500).send({ message: `Error updating address: ${error.message}` });
    }
}));
// Route to retrieve addresses by user_id
AddressRouter.get('/user/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        // Convert user_id to integer
        const userId = parseInt(user_id, 10);
        if (isNaN(userId)) {
            return res.status(400).send({ message: 'Invalid user ID.' });
        }
        // Check if the addresses for the user are already in Redis
        redis_1.default.get(`addresses:${userId}`, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error.' });
            }
            if (cachedData) {
                // If data is found in Redis, return it
                console.log('Cache hit, returning data from Redis');
                return res.status(200).send({ addresses: JSON.parse(cachedData) });
            }
            // If data is not in Redis, fetch from the database
            const addresses = yield Address_1.default.findAll({ where: { user_id: userId } });
            if (addresses.length === 0) {
                return res.status(404).send({ message: 'No addresses found for this user.' });
            }
            // Store the addresses in Redis with an expiration time of 2 seconds
            yield redis_1.default.set(`addresses:${userId}`, JSON.stringify(addresses));
            yield redis_1.default.expire(`addresses:${userId}`, 2);
            // Respond with the addresses
            res.status(200).send({ addresses });
        }));
    }
    catch (error) {
        console.error('Error retrieving addresses by user_id:', error);
        return res.status(500).send({ message: `Error retrieving addresses: ${error.message}` });
    }
}));
AddressRouter.patch('/update/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const { house_number, apartment, landmark, type, city, state, zipcode, country, alternative_phone_number } = req.body;
        // Find address by user ID
        const address = yield Address_1.default.findOne({ where: { user_id } });
        if (!address) {
            return res.status(404).send({ message: 'Address not found for the specified user ID.' });
        }
        // Update address details
        yield address.update({
            house_number,
            apartment,
            landmark,
            type,
            city,
            state,
            zipcode,
            country,
            alternative_phone_number
        });
        return res.status(200).send({ message: 'Address updated successfully', address });
    }
    catch (error) {
        console.error('Error updating address:', error);
        return res.status(500).send({ message: `Error updating address: ${error.message}` });
    }
}));
// Route to retrieve an address by ID
AddressRouter.get('/details/:address_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address_id } = req.params;
        // Check if the address details are already in Redis
        redis_1.default.get(`addressDetails:${address_id}`, (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error.' });
            }
            if (cachedData) {
                // If data is found in Redis, return it
                console.log('Cache hit, returning data from Redis');
                return res.status(200).send({ address: JSON.parse(cachedData) });
            }
            // If data is not in Redis, fetch from the database
            const address = yield Address_1.default.findByPk(address_id);
            if (!address) {
                return res.status(404).send({ message: 'Address not found.' });
            }
            // Store the address details in Redis with an expiration time of 2 seconds
            yield redis_1.default.set(`addressDetails:${address_id}`, JSON.stringify(address));
            yield redis_1.default.expire(`addressDetails:${address_id}`, 2);
            // Respond with the address details
            res.status(200).send({ address });
        }));
    }
    catch (error) {
        console.error('Error retrieving address details:', error);
        return res.status(500).send({ message: `Error retrieving address details: ${error.message}` });
    }
}));
// Route to delete an address by ID
AddressRouter.delete('/delete/:address_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address_id } = req.params;
        // Find and delete address by ID
        const result = yield Address_1.default.destroy({ where: { address_id } });
        if (result === 0) {
            return res.status(404).send({ message: 'Address not found.' });
        }
        return res.status(200).send({ message: 'Address deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting address:', error);
        return res.status(500).send({ message: `Error deleting address: ${error.message}` });
    }
}));
AddressRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if all addresses are already cached in Redis
        redis_1.default.get('allAddresses', (err, cachedData) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).send({ message: 'Internal server error.' });
            }
            if (cachedData) {
                // If the data is found in Redis, parse it and return it
                console.log('Cache hit, returning data from Redis');
                return res.status(200).json({ addresses: JSON.parse(cachedData) });
            }
            // If data is not found in Redis, fetch it from the database
            const addresses = yield Address_1.default.findAll();
            if (addresses.length === 0) {
                return res.status(404).send({ message: 'No addresses found.' });
            }
            // Cache all addresses in Redis with a 2 seconds expiration
            yield redis_1.default.set('allAddresses', JSON.stringify(addresses));
            yield redis_1.default.expire('allAddresses', 2);
            // Respond with the addresses
            return res.status(200).json({ addresses });
        }));
    }
    catch (error) {
        console.error('Error retrieving addresses:', error);
        return res.status(500).send({ message: `Error retrieving addresses: ${error.message}` });
    }
}));
AddressRouter.post('/user/:user_id/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const { house_number, apartment, landmark, type, city, state, zipcode, country, alternative_phone_number } = req.body;
        if (!house_number || !type) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }
        const newAddress = yield Address_1.default.create({
            house_number,
            apartment,
            landmark,
            type,
            user_id: parseInt(user_id, 10),
            city,
            state,
            zipcode,
            country,
            alternative_phone_number
        });
        return res.status(201).send({ message: 'Address created successfully', address: newAddress });
    }
    catch (error) {
        console.error('Error creating address:', error);
        return res.status(500).send({ message: `Error creating address: ${error.message}` });
    }
}));
exports.default = AddressRouter;
