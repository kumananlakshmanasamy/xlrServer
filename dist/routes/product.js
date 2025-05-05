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
const product_1 = __importDefault(require("../db/models/product")); // Adjust the path to your Product model
const SubCategory_1 = __importDefault(require("../db/models/SubCategory"));
const brand_1 = __importDefault(require("../db/models/brand"));
const image_1 = __importDefault(require("../db/models/image"));
const productRouter = express_1.default.Router();
// Create a new product
productRouter.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sub_category_id, brand_id, image_id, name, description, quantity, price, discount_price, is_available } = req.body;
        // Validate SubCategory ID
        if (sub_category_id) {
            const subCategoryExists = yield SubCategory_1.default.findByPk(sub_category_id);
            if (!subCategoryExists) {
                return res.status(400).json({ error: 'SubCategory ID does not exist' });
            }
        }
        // Validate Brand ID
        if (brand_id) {
            const brandExists = yield brand_1.default.findByPk(brand_id);
            if (!brandExists) {
                return res.status(400).json({ error: 'Brand ID does not exist' });
            }
        }
        // Validate Image ID
        if (image_id) {
            const imageExists = yield image_1.default.findByPk(image_id);
            if (!imageExists) {
                return res.status(400).json({ error: 'Image ID does not exist' });
            }
        }
        // Create new product
        const newProduct = yield product_1.default.create({
            sub_category_id,
            brand_id,
            image_id,
            name,
            description,
            quantity,
            price,
            discount_price,
            is_available
        });
        res.status(201).json(newProduct);
    }
    catch (error) {
        next(error);
    }
}));
// Get all products with optional category filter
productRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { sub_category_id } = req.query;
    try {
        const products = yield product_1.default.findAll({
            include: [
                { model: SubCategory_1.default, as: 'subCategory' },
                { model: brand_1.default, as: 'brand' },
                { model: image_1.default, as: 'image' }
            ],
            where: sub_category_id ? { '$subCategory.sub_category_id$': sub_category_id } : undefined // Only apply filter if categoryId is provided
        });
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
}));
// Get a product by ID
productRouter.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield product_1.default.findByPk(id, {
            include: [
                { model: SubCategory_1.default, as: 'subCategory' },
                { model: brand_1.default, as: 'brand' },
                { model: image_1.default, as: 'image' }
            ]
        });
        if (product) {
            res.status(200).json(product);
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (error) {
        next(error);
    }
}));
// Update a product by ID
productRouter.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { sub_category_id, brand_id, image_id, name, description, quantity, price, discount_price, is_available } = req.body;
        // Validate existence of related entities
        if (sub_category_id) {
            const subCategoryExists = yield SubCategory_1.default.findByPk(sub_category_id);
            if (!subCategoryExists) {
                return res.status(400).json({ error: 'SubCategory ID does not exist' });
            }
        }
        if (brand_id) {
            const brandExists = yield brand_1.default.findByPk(brand_id);
            if (!brandExists) {
                return res.status(400).json({ error: 'Brand ID does not exist' });
            }
        }
        if (image_id) {
            const imageExists = yield image_1.default.findByPk(image_id);
            if (!imageExists) {
                return res.status(400).json({ error: 'Image ID does not exist' });
            }
        }
        const [updated] = yield product_1.default.update({
            sub_category_id,
            brand_id,
            image_id,
            name,
            description,
            quantity,
            price,
            discount_price,
            is_available
        }, {
            where: { product_id: id }
        });
        if (updated) {
            const updatedProduct = yield product_1.default.findByPk(id);
            res.status(200).json(updatedProduct);
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (error) {
        next(error);
    }
}));
// Delete a product by ID
productRouter.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find the product by ID
        const product = yield product_1.default.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // Delete the product
        yield product.destroy();
        res.status(200).json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = productRouter;
