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
const dish_1 = __importDefault(require("../db/models/dish")); // Adjust the path to your Dish model
const image_1 = __importDefault(require("../db/models/image")); // Adjust the path to your Image model
const dishRouter = express_1.default.Router();
// Create a new dish
dishRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurant_id, name, description, price, image_id } = req.body;
        // Basic validation
        if (!restaurant_id || !name || !price || !image_id) {
            return res.status(400).json({ success: false, error: 'Required fields are missing' });
        }
        const newDish = yield dish_1.default.create({
            restaurant_id,
            name,
            description,
            price,
            image_id
        });
        res.status(201).json({ success: true, data: transformDishOutput(newDish) });
    }
    catch (err) {
        console.error('Error in /dishes:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
}));
// Get dish by ID
dishRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const dish = yield dish_1.default.findByPk(id, { include: [{ model: image_1.default, as: 'image' }] });
        if (!dish) {
            return res.status(404).send({ message: 'Dish not found.' });
        }
        return res.status(200).send(transformDishOutput(dish));
    }
    catch (error) {
        console.error('Error in fetching dish by ID:', error);
        return res.status(500).send({ message: `Error in fetching dish: ${error.message}` });
    }
}));
// Get all dishes
dishRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dishes = yield dish_1.default.findAll({ include: [image_1.default] });
        return res.status(200).send(dishes.map(transformDishOutput));
    }
    catch (error) {
        console.error('Error in fetching dishes:', error);
        return res.status(500).send({ message: `Error in fetching dishes: ${error.message}` });
    }
}));
// Get all dishes by restaurant_id
dishRouter.get('/restaurant/:restaurant_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurant_id } = req.params;
        const dishes = yield dish_1.default.findAll({
            where: { restaurant_id },
            include: [{ model: image_1.default, as: 'image' }],
        });
        if (dishes.length === 0) {
            return res.status(404).send({ message: 'No dishes found for this restaurant.' });
        }
        return res.status(200).send(dishes.map(transformDishOutput));
    }
    catch (error) {
        console.error('Error in fetching dishes by restaurant ID:', error);
        return res.status(500).send({ message: `Error in fetching dishes: ${error.message}` });
    }
}));
// Update dish
dishRouter.patch('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { restaurant_id, name, description, price, image_id } = req.body;
        const [updated] = yield dish_1.default.update({ restaurant_id, name, description, price, image_id }, { where: { id } });
        if (updated) {
            const updatedDish = yield dish_1.default.findByPk(id, { include: [image_1.default] });
            return res.status(200).send(transformDishOutput(updatedDish));
        }
        else {
            return res.status(404).send({ message: 'Dish not found.' });
        }
    }
    catch (error) {
        console.error('Error in updating dish:', error);
        return res.status(500).send({ message: `Error in updating dish: ${error.message}` });
    }
}));
// Delete dish
dishRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const dish = yield dish_1.default.findByPk(id);
        if (!dish) {
            return res.status(404).send({ message: 'Dish not found.' });
        }
        // Hard delete dish
        yield dish_1.default.destroy({ where: { id } });
        return res.status(200).send({ message: 'Dish deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleting dish:', error);
        return res.status(500).send({ message: `Error in deleting dish: ${error.message}` });
    }
}));
// Helper function to transform the dish output
// function transformDishOutput(dish: any) {
//   if (!dish) return null;
//   const { id, restaurant_id, name, description, price, image_id, createdAt, updatedAt } = dish;
//   return {
//     id,
//     restaurant_id,
//     name,
//     description,
//     price,
//     image_id,
//     createdAt,
//     updatedAt,
//     Image: image_id.toString() // Transform the Image field to just image_id as a string
//   };
// }
function transformDishOutput(dish) {
    // console.log(dish); // Log the entire dish object
    if (!dish)
        return null;
    const { id, restaurant_id, name, description, price, createdAt, updatedAt, image } = dish;
    return {
        id,
        restaurant_id,
        name,
        description,
        price,
        createdAt,
        updatedAt,
        imageUrl: image ? image.image_url : null,
    };
}
exports.default = dishRouter;
