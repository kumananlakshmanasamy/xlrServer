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
const order_1 = __importDefault(require("../db/models/order"));
const order_items_1 = __importDefault(require("../db/models/order_items"));
const dish_1 = __importDefault(require("../db/models/dish"));
const CartItemRestaurants_1 = __importDefault(require("../db/models/CartItemRestaurants"));
const config_1 = __importDefault(require("../db/config"));
const OrderItemRouter = express_1.default.Router();
// Create OrderItem
OrderItemRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id, dish_id, quantity, price } = req.body;
        // Validate if Order and Dish exist
        const order = yield order_1.default.findByPk(order_id);
        const dish = yield dish_1.default.findByPk(dish_id);
        if (!order || !dish) {
            return res.status(400).send({ message: 'Invalid order_id or dish_id' });
        }
        const newOrderItem = yield order_items_1.default.create({
            order_id,
            dish_id,
            quantity,
            price,
            is_deleted: false
        });
        res.status(201).send(newOrderItem);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
// Get all OrderItems
OrderItemRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderItems = yield order_items_1.default.findAll({
            where: { is_deleted: false },
            include: [
                { model: order_1.default, as: 'order' },
                { model: dish_1.default, as: 'dish' }
            ]
        });
        res.status(200).send(orderItems);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
// Get OrderItem by ID
OrderItemRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const orderItem = yield order_items_1.default.findByPk(id, {
            include: [
                { model: order_1.default, as: 'order' },
                { model: dish_1.default, as: 'dish' }
            ]
        });
        if (!orderItem) {
            return res.status(404).send({ message: 'OrderItem not found' });
        }
        res.status(200).send(orderItem);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
// Update OrderItem by ID
OrderItemRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { order_id, dish_id, quantity, price, is_deleted } = req.body;
        // Validate if Order and Dish exist
        if (order_id) {
            const order = yield order_1.default.findByPk(order_id);
            if (!order) {
                return res.status(400).send({ message: 'Invalid order_id' });
            }
        }
        if (dish_id) {
            const dish = yield dish_1.default.findByPk(dish_id);
            if (!dish) {
                return res.status(400).send({ message: 'Invalid dish_id' });
            }
        }
        const orderItem = yield order_items_1.default.findByPk(id);
        if (!orderItem) {
            return res.status(404).send({ message: 'OrderItem not found' });
        }
        // Update the order item with the new values
        yield orderItem.update({ order_id, dish_id, quantity, price, is_deleted });
        res.status(200).send(orderItem);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
// Soft delete OrderItem by ID
OrderItemRouter.patch('/:id/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const orderItem = yield order_items_1.default.findByPk(id);
        if (!orderItem) {
            return res.status(404).send({ message: 'OrderItem not found' });
        }
        yield orderItem.update({ is_deleted: true, deleted_at: new Date() });
        res.status(200).send({ message: 'OrderItem soft deleted' });
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
// Route to move items from CartItemRest to OrderItems and mark CartItemRest items as deleted
OrderItemRouter.post('/checkout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, total_price, restaurant_id, address_id, payment_method } = req.body;
    // Validate required fields
    if (!user_id || !total_price || !restaurant_id || !address_id || !payment_method) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    // Start a transaction
    const transaction = yield config_1.default.transaction();
    try {
        // Step 1: Find all cart items for the user
        const cartItems = yield CartItemRestaurants_1.default.findAll({
            where: { user_id, is_deleted: false },
            transaction,
        });
        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'No items in the cart to checkout.' });
        }
        // Step 2: Create a new order
        const newOrder = yield order_1.default.create({
            user_id,
            total_price,
            restaurant_id,
            address_id,
            payment_method,
            order_status: 'pending'
        }, { transaction });
        // Step 3: Move cart items to order items
        const orderItems = cartItems.map(item => ({
            order_id: newOrder.order_id,
            dish_id: item.dish_id,
            quantity: item.quantity,
            price: item.totalPrice || 0,
            is_deleted: false
        }));
        yield order_items_1.default.bulkCreate(orderItems, { transaction });
        // Step 4: Mark cart items as deleted
        yield CartItemRestaurants_1.default.update({ is_deleted: true }, { where: { user_id, is_deleted: false }, transaction });
        // Commit the transaction
        yield transaction.commit();
        res.status(200).json({ message: 'Checkout successful. Cart items moved to order items and cart emptied.' });
    }
    catch (error) {
        // Rollback the transaction in case of an error
        yield transaction.rollback();
        console.error(error);
        res.status(500).json({ message: 'An error occurred during checkout.' });
    }
}));
exports.default = OrderItemRouter;
