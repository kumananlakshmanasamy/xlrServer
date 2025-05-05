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
const CartItemRestaurants_1 = __importDefault(require("../db/models/CartItemRestaurants"));
const dish_1 = __importDefault(require("../db/models/dish"));
const image_1 = __importDefault(require("../db/models/image"));
const RestaurantCartRouter = express_1.default.Router();
// Get all cart items for a user
RestaurantCartRouter.get('/cart-items/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params; // Changed from req.body to req.params
    console.log("User ID:", user_id);
    try {
        const cartItems = yield CartItemRestaurants_1.default.findAll({
            where: { user_id: user_id, is_deleted: false },
            include: [{
                    model: dish_1.default,
                    include: [{ model: image_1.default, as: 'image' }] // Correctly include Image with alias 'image'
                }],
        });
        // Calculate total price for each cart item
        const cartItemsWithTotalPrice = yield Promise.all(cartItems.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            yield item.calculateTotalPrice(); // Ensure total price is calculated
            return item.toJSON();
        })));
        res.status(200).json(cartItemsWithTotalPrice);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch cart items', error });
    }
}));
// Add an item to the cart
RestaurantCartRouter.post('/cart-items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, dish_id, restaurant_id, quantity } = req.body;
        // Basic validation
        if (!user_id || !dish_id || !restaurant_id || !quantity) {
            return res.status(400).json({ success: false, error: 'Required fields are missing' });
        }
        // Fetch the associated image_id based on dish_id
        const dish = yield dish_1.default.findByPk(dish_id, {
            include: [{ model: image_1.default, as: 'image' }] // Ensure 'as' alias is correctly used here
        });
        if (!dish || !dish.image_id) {
            return res.status(404).json({ success: false, error: 'Dish or associated image not found.' });
        }
        const newCartItem = yield CartItemRestaurants_1.default.create({
            user_id,
            dish_id,
            restaurant_id,
            quantity,
            image_id: dish.image_id // Set the image_id based on the associated dish
        });
        // Calculate total price
        yield newCartItem.calculateTotalPrice();
        // Save with the calculated total price
        yield newCartItem.save();
        res.status(201).json({ success: true, data: newCartItem });
    }
    catch (error) {
        console.error('Error in /cart-items:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
}));
// Update an item in the cart
RestaurantCartRouter.put('/cart-items/put/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        const cartItem = yield CartItemRestaurants_1.default.findByPk(id);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        cartItem.quantity = quantity;
        yield cartItem.calculateTotalPrice(); // Recalculate total price
        yield cartItem.save(); // Save with the recalculated total price
        res.status(200).json(cartItem);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update cart item', error });
    }
}));
// Patch (partially update) an item in the cart
RestaurantCartRouter.patch('/cart-items/patch/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body; // The fields to be updated
    try {
        const cartItem = yield CartItemRestaurants_1.default.findByPk(id);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        // Apply updates
        Object.assign(cartItem, updates);
        // Calculate total price if quantity is updated
        if (updates.quantity !== undefined) {
            yield cartItem.calculateTotalPrice();
        }
        yield cartItem.save(); // Save with the updated fields
        res.status(200).json(cartItem);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update cart item', error });
    }
}));
// Remove an item from the cart (soft delete)
RestaurantCartRouter.delete('/cart-items/delete/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const rowsDeleted = yield CartItemRestaurants_1.default.destroy({
            where: {
                id
            }
        });
        if (rowsDeleted === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        res.status(200).json({ message: 'Cart item successfully deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete cart item', error });
    }
}));
// Remove all cart items for a user (soft delete)
RestaurantCartRouter.delete('/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Delete request received for user_id:", req.params.user_id);
    const { user_id } = req.params; // Destructure user_id from params
    try {
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Delete all cart items for the specified user
        const deletedRows = yield CartItemRestaurants_1.default.destroy({
            where: { user_id: user_id, is_deleted: false } // Only delete items that are not already deleted
        });
        console.log("Number of cart items deleted:", deletedRows);
        if (deletedRows === 0) {
            return res.status(200).json({ message: 'No cart items found for this user, nothing to delete.' });
        }
        res.status(200).json({ message: 'All cart items deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete all cart items', error });
    }
}));
// Get a single cart item by its ID
// RestaurantCartRouter.get('/cart-items/:id', async (req: Request, res: Response) => {
//     const { id } = req.params; // Destructure id from params
//     console.log(`Fetching cart item with ID: ${id}`); // Debug log
//     try {
//         // Fetch the cart item with the associated dish and image
//         const cartItem = await CartItem.findByPk(id, {
//             include: [{
//                 model: Dish,
//                 include: [{ model: Image, as: 'image' }] // Correctly include Image with alias 'image'
//             }],
//         });
//         if (!cartItem) {
//             return res.status(404).json({ message: 'Cart item not found' });
//         }
//         // Calculate total price (if needed)
//         await cartItem.calculateTotalPrice();
//         res.status(200).json(cartItem);
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to fetch cart item', error });
//     }
// });
// Get all cart items by cart ID
RestaurantCartRouter.get('/cart/:cart_id/items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cart_id } = req.params; // Destructure cart_id from params
    try {
        // Fetch all cart items associated with the given cart_id
        const cartItems = yield CartItemRestaurants_1.default.findAll({
            where: { id: cart_id, is_deleted: false },
            include: [{
                    model: dish_1.default,
                    include: [{ model: image_1.default, as: 'image' }] // Correctly include Image with alias 'image'
                }],
        });
        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'No cart items found for this cart ID' });
        }
        // Calculate total price for each cart item
        const cartItemsWithTotalPrice = yield Promise.all(cartItems.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            yield item.calculateTotalPrice(); // Ensure total price is calculated
            return item.toJSON();
        })));
        res.status(200).json(cartItemsWithTotalPrice);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch cart items', error });
    }
}));
exports.default = RestaurantCartRouter;
