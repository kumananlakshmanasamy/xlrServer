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
const SubCategory_1 = __importDefault(require("../db/models/SubCategory"));
const image_1 = __importDefault(require("../db/models/image"));
const Category_1 = __importDefault(require("../db/models/Category"));
const SubCategoryRouter = express_1.default.Router();
// Create SubCategory
SubCategoryRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id, name, description, image_id } = req.body;
        // Validate that the category_id exists in the Category table
        const categoryExists = yield Category_1.default.findByPk(category_id);
        if (!categoryExists) {
            return res.status(400).json({ error: 'Category ID does not exist' });
        }
        // Validate that the image_id exists in the Image table if provided
        if (image_id) {
            const imageExists = yield image_1.default.findByPk(image_id);
            if (!imageExists) {
                return res.status(400).json({ error: 'Image ID does not exist' });
            }
        }
        const newSubCategory = yield SubCategory_1.default.create({ category_id, name, description, image_id });
        res.status(201).send(newSubCategory);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
// Get all SubCategories
SubCategoryRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category_id } = req.query;
    try {
        const subCategories = yield SubCategory_1.default.findAll({
            include: [
                { model: Category_1.default, as: 'category' },
                { model: image_1.default, as: 'image' }
            ],
            where: category_id ? { '$category.category_id$': category_id } : undefined, // Apply filter if categoryId is provided
        });
        res.status(200).send(subCategories);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
// Get SubCategory by ID
SubCategoryRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const subCategory = yield SubCategory_1.default.findByPk(id, {
            include: [
                { model: Category_1.default, as: 'category' },
                { model: image_1.default, as: 'image' }
            ]
        });
        if (!subCategory) {
            return res.status(404).send({ message: 'SubCategory not found' });
        }
        res.status(200).send(subCategory);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
exports.default = SubCategoryRouter;
