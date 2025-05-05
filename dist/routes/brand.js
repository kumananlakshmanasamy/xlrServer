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
const brand_1 = __importDefault(require("../db/models/brand"));
const image_1 = __importDefault(require("../db/models/image"));
const BrandRouter = express_1.default.Router();
// Create a new brand
BrandRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, image_id } = req.body;
        // Validate that the image_id exists in the Image table if provided
        if (image_id) {
            const imageExists = yield image_1.default.findByPk(image_id);
            if (!imageExists) {
                return res.status(400).json({ error: 'Image ID does not exist' });
            }
        }
        // Create brand object to be inserted
        const createBrandObject = {
            name,
            description,
            image_id
        };
        console.log("Creating Brand with object:", createBrandObject);
        // Create brand using Sequelize model
        const createBrand = yield brand_1.default.create(createBrandObject);
        return res.status(200).send({ message: "Brand created successfully", data: createBrand });
    }
    catch (error) {
        console.error("Error in creating brand:", error);
        return res.status(500).send({ message: `Error in creating brand: ${error.message}` });
    }
}));
// Get brand by ID
BrandRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const brand = yield brand_1.default.findOne({ where: { brand_id: id } });
        if (!brand) {
            return res.status(404).send({ message: "Brand not found." });
        }
        return res.status(200).send(brand);
    }
    catch (error) {
        console.error("Error in fetching brand by ID:", error);
        return res.status(500).send({ message: `Error in fetching brand: ${error.message}` });
    }
}));
// Get all brands
BrandRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const brands = yield brand_1.default.findAll();
        return res.status(200).send(brands);
    }
    catch (error) {
        console.error("Error in fetching brands:", error);
        return res.status(500).send({ message: `Error in fetching brands: ${error.message}` });
    }
}));
// Update brand
BrandRouter.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, image_id } = req.body;
        const brand = yield brand_1.default.findOne({ where: { brand_id: id } });
        if (!brand) {
            return res.status(404).send({ message: "Brand not found." });
        }
        // Update brand object
        const updateBrandObject = {
            name,
            description,
            image_id
        };
        // Update brand using Sequelize model
        yield brand_1.default.update(updateBrandObject, { where: { brand_id: id } });
        return res.status(200).send({ message: "Brand updated successfully" });
    }
    catch (error) {
        console.error("Error in updating brand:", error);
        return res.status(500).send({ message: `Error in updating brand: ${error.message}` });
    }
}));
// Hard delete brand
BrandRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const brand = yield brand_1.default.findOne({ where: { brand_id: id } });
        if (!brand) {
            return res.status(404).send({ message: "Brand not found." });
        }
        // Hard delete brand
        yield brand.destroy();
        return res.status(200).send({ message: "Brand deleted successfully" });
    }
    catch (error) {
        console.error("Error in deleting brand:", error);
        return res.status(500).send({ message: `Error in deleting brand: ${error.message}` });
    }
}));
// Get total count of all brands
BrandRouter.get('/total/count/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalBrandsCount = yield brand_1.default.count();
        res.json({ count: totalBrandsCount });
    }
    catch (error) {
        console.error('Error fetching total brands count:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
exports.default = BrandRouter;
