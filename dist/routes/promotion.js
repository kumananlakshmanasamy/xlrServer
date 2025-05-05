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
const promotions_1 = __importDefault(require("../db/models/promotions")); // Adjust import based on your file structure
const PromotionRouter = express_1.default.Router();
// Route to create a new promotion
PromotionRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promotion_name, description, promotion_type, start_date, end_date, discount_amount, discount_percentage, eligibility_criteria, usage_limit, promotion_code, associated_campaign } = req.body;
        // Validate required fields
        if (!promotion_name || !promotion_type || !start_date || !end_date || !promotion_code) {
            return res.status(400).send({ message: 'Please fill in all required fields.' });
        }
        // Create new promotion
        const newPromotion = yield promotions_1.default.create({
            promotion_name,
            description,
            promotion_type,
            start_date,
            end_date,
            discount_amount,
            discount_percentage,
            eligibility_criteria,
            usage_limit,
            promotion_code,
            associated_campaign
        });
        return res.status(201).send({ message: 'Promotion created successfully', promotion: newPromotion });
    }
    catch (error) {
        console.error('Error creating promotion:', error);
        return res.status(500).send({ message: `Error creating promotion: ${error.message}` });
    }
}));
// Route to update an existing promotion
PromotionRouter.patch('/update/:promotion_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promotion_id } = req.params;
        const { promotion_name, description, promotion_type, start_date, end_date, discount_amount, discount_percentage, eligibility_criteria, usage_limit, promotion_code, associated_campaign } = req.body;
        // Find promotion by ID
        const promotion = yield promotions_1.default.findByPk(promotion_id);
        if (!promotion) {
            return res.status(404).send({ message: 'Promotion not found.' });
        }
        // Update promotion details
        yield promotion.update({
            promotion_name,
            description,
            promotion_type,
            start_date,
            end_date,
            discount_amount,
            discount_percentage,
            eligibility_criteria,
            usage_limit,
            promotion_code,
            associated_campaign
        });
        return res.status(200).send({ message: 'Promotion updated successfully', promotion });
    }
    catch (error) {
        console.error('Error updating promotion:', error);
        return res.status(500).send({ message: `Error updating promotion: ${error.message}` });
    }
}));
// Route to retrieve a promotion by ID
PromotionRouter.get('/details/:promotion_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promotion_id } = req.params;
        // Find promotion by ID
        const promotion = yield promotions_1.default.findByPk(promotion_id);
        if (!promotion) {
            return res.status(404).send({ message: 'Promotion not found.' });
        }
        return res.status(200).send({ promotion });
    }
    catch (error) {
        console.error('Error retrieving promotion details:', error);
        return res.status(500).send({ message: `Error retrieving promotion details: ${error.message}` });
    }
}));
// Route to delete a promotion by ID
PromotionRouter.delete('/delete/:promotion_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promotion_id } = req.params;
        // Find and delete promotion by ID
        const result = yield promotions_1.default.destroy({ where: { promotion_id } });
        if (result === 0) {
            return res.status(404).send({ message: 'Promotion not found.' });
        }
        return res.status(200).send({ message: 'Promotion deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting promotion:', error);
        return res.status(500).send({ message: `Error deleting promotion: ${error.message}` });
    }
}));
exports.default = PromotionRouter;
