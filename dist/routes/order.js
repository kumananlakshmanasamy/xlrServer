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
const order_1 = __importDefault(require("../db/models/order")); // Adjust the path as necessary
const models_1 = require("../db/models");
const CartItemRestaurants_1 = __importDefault(require("../db/models/CartItemRestaurants")); // Adjust the path as necessary
const order_items_1 = __importDefault(require("../db/models/order_items")); // Adjust the path as necessary
const dish_1 = __importDefault(require("../db/models/dish")); // Adjust the path as necessary
const orderRouter = express_1.default.Router();
// Create a new order
orderRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, total_price, order_status, restaurant_id, address_id, payment_method } = req.body;
        if (!user_id || !total_price || !order_status || !restaurant_id || !address_id || !payment_method) {
            return res.status(400).json({ message: 'Missing required fields: user_id, total_price, order_status, restaurant_id, address_id, payment_method' });
        }
        // Create the new order
        const newOrder = yield order_1.default.create({
            user_id,
            restaurant_id,
            address_id,
            total_price,
            order_status,
            payment_method
        });
        // Fetch items from the user's cart
        const cartItems = yield CartItemRestaurants_1.default.findAll({ where: { user_id } });
        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        // Iterate over the cart items and create OrderItem records
        for (const item of cartItems) {
            const dish = yield dish_1.default.findByPk(item.dish_id); // Fetch dish details for the order item
            if (!dish) {
                return res.status(404).json({ message: `Dish with ID ${item.dish_id} not found` });
            }
            yield order_items_1.default.create({
                order_id: newOrder.order_id,
                dish_id: item.dish_id,
                quantity: item.quantity,
                price: dish.price,
                is_deleted: false, // Add the is_deleted field with a default value
            });
        }
        // Clear the user's cart after the order is placed
        yield CartItemRestaurants_1.default.destroy({ where: { user_id } });
        res.status(201).json({ success: true, order_id: newOrder.order_id });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
    }
}));
// Get all orders
orderRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order_1.default.findAll({
            include: [models_1.User] // Include related User data
        });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
}));
// Get a single order by ID
orderRouter.get('/:order_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id } = req.params;
        const order = yield order_1.default.findByPk(order_id, {
            include: [models_1.User] // Include related User data
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
}));
// Update an order by ID
orderRouter.patch('/:order_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id } = req.params;
        const { user_id, total_price, order_status } = req.body;
        const [updated] = yield order_1.default.update({
            user_id,
            total_price,
            order_status
        }, {
            where: { order_id },
        });
        if (updated) {
            const updatedOrder = yield order_1.default.findByPk(order_id);
            res.status(200).json(updatedOrder);
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
}));
// Delete an order by ID
orderRouter.delete('/:order_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id } = req.params;
        const deleted = yield order_1.default.destroy({
            where: { order_id },
        });
        if (deleted) {
            res.status(204).json({ message: 'Order deleted' });
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
}));
// Get order by ID and User ID
orderRouter.get('/:order_id/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id, user_id } = req.params;
        const order = yield order_1.default.findOne({
            where: {
                order_id,
                user_id,
            },
            include: [models_1.User], // Optionally include related User data
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found for the given user' });
        }
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
}));
exports.default = orderRouter;
