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
const add_to_cart_1 = __importDefault(require("../db/models/add_to_cart")); // Update the path as needed
const users_1 = __importDefault(require("../db/models/users")); // Update the path as needed
const product_1 = __importDefault(require("../db/models/product")); // Update the path as needed
const promotions_1 = __importDefault(require("../db/models/promotions")); // Update the path as needed
const cartRouter = express_1.default.Router();
cartRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, product_id, quantity, price, promotion_id } = req.body;
    if (user_id === undefined || product_id === undefined || quantity === undefined || price === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        // Validate if the user exists
        const userExists = yield users_1.default.findByPk(user_id);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Validate if the product exists
        const productExists = yield product_1.default.findByPk(product_id);
        if (!productExists) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Calculate initial total price
        let total_price = Number(quantity) * Number(price);
        // Check if the item already exists in the cart and is not deleted
        const existingItem = yield add_to_cart_1.default.findOne({
            where: {
                user_id,
                product_id,
                is_deleted: false
            }
        });
        if (existingItem) {
            // Update the quantity and total_price if the item already exists
            existingItem.quantity += Number(quantity);
            existingItem.price = Number(price); // Update the price
            existingItem.total_price = existingItem.quantity * existingItem.price; // Recalculate total_price
            yield existingItem.save();
            return res.status(200).json(existingItem);
        }
        // Create a new cart item
        const newItem = yield add_to_cart_1.default.create({
            user_id,
            product_id,
            quantity: Number(quantity),
            price: Number(price),
            total_price,
            is_deleted: false,
            promotion_id
        });
        res.status(201).json(newItem);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding item to cart' });
    }
}));
// Route to update delivery fee for all items in a user's cart
cartRouter.post('/update-delivery-fee/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    const { delivery_fee } = req.body;
    // Ensure delivery_fee is provided and is a number
    if (delivery_fee === undefined || isNaN(Number(delivery_fee))) {
        return res.status(400).json({ message: 'Valid delivery fee is required' });
    }
    try {
        // Convert delivery_fee to a number
        const numericDeliveryFee = Number(delivery_fee);
        // Fetch all items in the user's cart
        const cartItems = yield add_to_cart_1.default.findAll({
            where: { user_id, is_deleted: false }
        });
        if (!cartItems.length) {
            return res.status(404).json({ message: 'No items found in cart' });
        }
        // Calculate the total payment before applying the delivery fee
        let totalPaymentBeforeFee = 0;
        for (const item of cartItems) {
            const promotion = item.promotion_id ? yield promotions_1.default.findByPk(item.promotion_id) : null;
            const discount = (promotion === null || promotion === void 0 ? void 0 : promotion.discount_percentage) || 0;
            const quantity = Number(item.quantity);
            const price = Number(item.price);
            totalPaymentBeforeFee += quantity * price * (1 - discount / 100);
        }
        // Add the delivery fee to the total payment
        const totalPaymentAfterFee = totalPaymentBeforeFee + numericDeliveryFee;
        res.status(200).json({
            message: 'Delivery fee applied to total payment',
            total_payment_before_fee: totalPaymentBeforeFee,
            total_payment_after_fee: totalPaymentAfterFee
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error applying delivery fee to total payment' });
    }
}));
// Route to apply a promotion to the total payment
cartRouter.post('/apply-promotion/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    const { promotion_id } = req.body;
    if (!promotion_id) {
        return res.status(400).json({ message: 'Promotion ID is required' });
    }
    try {
        // Validate if the promotion exists
        const promotion = yield promotions_1.default.findByPk(promotion_id);
        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }
        // Fetch all items in the user's cart
        const cartItems = yield add_to_cart_1.default.findAll({
            where: { user_id, is_deleted: false }
        });
        if (!cartItems.length) {
            return res.status(404).json({ message: 'No items found in cart' });
        }
        // Calculate initial total payment before applying the promotion
        let totalPaymentBeforePromotion = cartItems.reduce((sum, item) => {
            var _a;
            const quantity = Number(item.quantity);
            const price = Number(item.price);
            const deliveryFee = (_a = item.delivery_fee) !== null && _a !== void 0 ? _a : 0;
            return sum + (quantity * price + deliveryFee); // Calculate total price before promotion
        }, 0);
        // Apply the promotion to the total payment
        const discount = promotion.discount_percentage || 0;
        const totalPaymentAfterPromotion = totalPaymentBeforePromotion * (1 - discount / 100);
        res.status(200).json({
            message: 'Promotion applied to total payment',
            total_payment_before_promotion: totalPaymentBeforePromotion,
            total_payment_after_promotion: totalPaymentAfterPromotion
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error applying promotion to cart items' });
    }
}));
cartRouter.put('/:cart_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cart_id } = req.params;
    const { quantity, price, promotion_id } = req.body;
    if (quantity === undefined || price === undefined) {
        return res.status(400).json({ message: 'Quantity and price are required' });
    }
    try {
        const item = yield add_to_cart_1.default.findByPk(cart_id);
        if (!item || item.is_deleted) {
            return res.status(404).json({ message: 'Item not found' });
        }
        item.quantity = Number(quantity);
        item.price = Number(price); // Update the price
        item.total_price = item.quantity * item.price; // Recalculate total_price
        item.promotion_id = promotion_id; // Update promotion_id if applicable
        yield item.save();
        res.status(200).json(item);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating cart item' });
    }
}));
// Remove item from cart (soft delete)
cartRouter.delete('/:cart_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cart_id } = req.params;
    try {
        const item = yield add_to_cart_1.default.findByPk(cart_id);
        if (!item || item.is_deleted) {
            return res.status(404).json({ message: 'Item not found' });
        }
        yield item.destroy();
        item.is_deleted = true;
        yield item.save();
        res.status(200).json({ message: 'Item removed from cart' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error removing item from cart' });
    }
}));
// Get specific details of items in the cart for a user and calculate total payment
cartRouter.get('/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    try {
        // Fetch specific details from the cart, including promotion_id
        const items = yield add_to_cart_1.default.findAll({
            attributes: ['cart_id', 'product_id', 'quantity', 'total_price', 'promotion_id'],
            where: { user_id, is_deleted: false }
        });
        if (!items.length) {
            return res.status(404).json({ message: 'No items found in cart' });
        }
        // Calculate the total payment
        const totalPayment = items.reduce((sum, item) => {
            var _a;
            // Assuming total_price is already included in the item
            return sum + ((_a = item.total_price) !== null && _a !== void 0 ? _a : 0); // Use 0 if total_price is undefined
        }, 0);
        // Respond with specific details and total payment
        res.status(200).json({
            user_id,
            items,
            total_payment: totalPayment
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving cart items' });
    }
}));
cartRouter.get('/total/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    try {
        const items = yield add_to_cart_1.default.findAll({
            where: { user_id, is_deleted: false }
        });
        if (!items.length) {
            return res.status(404).json({ message: 'No items found in cart' });
        }
        // Calculate the total amount
        const total_payment = items.reduce((sum, item) => sum + item.total_price, 0);
        res.status(200).json({ total_payment });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving cart total payment' });
    }
}));
exports.default = cartRouter;
