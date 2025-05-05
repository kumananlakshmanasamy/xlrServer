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
const restaurant_1 = __importDefault(require("../db/models/restaurant")); // Adjust the path to your Restaurant model
const image_1 = __importDefault(require("../db/models/image"));
const restaurantRouter = express_1.default.Router();
// Create a new restaurant
restaurantRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, location, phone, rating, opening_time, closing_time, image_id } = req.body;
        if (image_id) {
            const imageExists = yield image_1.default.findByPk(image_id);
            if (!imageExists) {
                return res.status(400).json({ error: 'Image ID does not exist' });
            }
        }
        // Basic validation
        if (!name || !location) {
            return res.status(400).json({ success: false, error: 'Name and location are required' });
        }
        const newRestaurant = yield restaurant_1.default.create({
            name,
            location,
            phone,
            rating,
            opening_time,
            closing_time,
            image_id
        });
        res.status(201).json({ success: true, data: newRestaurant });
    }
    catch (err) {
        console.error('Error in /restaurants:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
}));
// Get restaurant by ID
restaurantRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const restaurant = yield restaurant_1.default.findByPk(id, {
            include: [
                { model: image_1.default, as: 'image' }
            ],
        });
        if (!restaurant) {
            return res.status(404).send({ message: 'Restaurant not found.' });
        }
        return res.status(200).send(restaurant);
    }
    catch (error) {
        console.error('Error in fetching restaurant by ID:', error);
        return res.status(500).send({ message: `Error in fetching restaurant: ${error.message}` });
    }
}));
// Get all restaurants
restaurantRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const restaurants = yield restaurant_1.default.findAll({
            include: [
                { model: image_1.default, as: 'image' }
            ],
            where: id ? { '$category.category_id$': id } : undefined,
        });
        return res.status(200).send(restaurants);
    }
    catch (error) {
        console.error('Error in fetching restaurants:', error);
        return res.status(500).send({ message: `Error in fetching restaurants: ${error.message}` });
    }
}));
// Update restaurant
restaurantRouter.patch('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, location, phone, rating, opening_time, closing_time, image_id } = req.body;
        const [updated] = yield restaurant_1.default.update({ name, location, phone, rating, opening_time, closing_time, image_id }, { where: { id } });
        if (updated) {
            const updatedRestaurant = yield restaurant_1.default.findByPk(id);
            return res.status(200).send(updatedRestaurant);
        }
        else {
            return res.status(404).send({ message: 'Restaurant not found.' });
        }
    }
    catch (error) {
        console.error('Error in updating restaurant:', error);
        return res.status(500).send({ message: `Error in updating restaurant: ${error.message}` });
    }
}));
// Delete restaurant
restaurantRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const restaurant = yield restaurant_1.default.findByPk(id);
        if (!restaurant) {
            return res.status(404).send({ message: 'Restaurant not found.' });
        }
        // Hard delete restaurant
        yield restaurant_1.default.destroy({ where: { id } });
        return res.status(200).send({ message: 'Restaurant deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleting restaurant:', error);
        return res.status(500).send({ message: `Error in deleting restaurant: ${error.message}` });
    }
}));
exports.default = restaurantRouter;
