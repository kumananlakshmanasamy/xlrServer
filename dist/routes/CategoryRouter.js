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
const Category_1 = __importDefault(require("../db/models/Category"));
const SuperCategory_1 = __importDefault(require("../db/models/SuperCategory"));
const image_1 = __importDefault(require("../db/models/image"));
const CategoryRouter = express_1.default.Router();
// Create Category
CategoryRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { super_category_id, name, description, image_id } = req.body;
        // Validate if SuperCategory exists
        const superCategory = yield SuperCategory_1.default.findByPk(super_category_id);
        if (!superCategory) {
            return res.status(400).send({ message: 'Invalid super_category_id' });
        }
        // Validate if Image exists (if provided)
        if (image_id) {
            const image = yield image_1.default.findByPk(image_id);
            if (!image) {
                return res.status(400).send({ message: 'Invalid image_id' });
            }
        }
        const newCategory = yield Category_1.default.create({ super_category_id, name, description, image_id });
        res.status(201).send(newCategory);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
// Get all Categories
CategoryRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category_1.default.findAll({
            include: [
                { model: SuperCategory_1.default, as: 'superCategory' },
                { model: image_1.default, as: 'image' }
            ]
        });
        res.status(200).send(categories);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
// Get Category by ID
CategoryRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield Category_1.default.findByPk(id, {
            include: [
                { model: SuperCategory_1.default, as: 'superCategory' },
                { model: image_1.default, as: 'image' }
            ]
        });
        if (!category) {
            return res.status(404).send({ message: 'Category not found' });
        }
        res.status(200).send(category);
    }
    catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).send({ message: error.message });
    }
}));
exports.default = CategoryRouter;
