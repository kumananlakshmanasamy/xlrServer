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
const SuperCategory_1 = __importDefault(require("../db/models/SuperCategory"));
const SuperCategoryRouter = express_1.default.Router();
// Create SuperCategory
SuperCategoryRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const newSuperCategory = yield SuperCategory_1.default.create({ name, description });
        res.status(201).send(newSuperCategory);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
// Get all SuperCategories
SuperCategoryRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const superCategories = yield SuperCategory_1.default.findAll();
        res.status(200).send(superCategories);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
// Get SuperCategory by ID
SuperCategoryRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const superCategory = yield SuperCategory_1.default.findByPk(id);
        if (!superCategory) {
            return res.status(404).send({ message: 'SuperCategory not found' });
        }
        res.status(200).send(superCategory);
    }
    catch (error) {
        res.status(500).send({ message: error.message });
    }
}));
exports.default = SuperCategoryRouter;
