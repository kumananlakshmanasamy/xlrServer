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
const inventory_1 = __importDefault(require("../db/models/inventory")); // Adjust the path to your Inventory model
const product_1 = __importDefault(require("../db/models/product")); // Adjust the path to your Product model
const inventoryRouter = express_1.default.Router();
// Create a new inventory
inventoryRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { product_id, quantity, warehouse_location, restock_date } = req.body;
        // Basic validation
        if (!product_id || !quantity || !warehouse_location || !restock_date) {
            return res.status(400).json({ error: 'Product ID, quantity, warehouse location, and restock date are required' });
        }
        const newInventory = yield inventory_1.default.create({
            product_id,
            quantity,
            warehouse_location,
            restock_date
        });
        res.status(201).json(newInventory);
    }
    catch (error) {
        console.error('Error creating inventory:', error);
        res.status(500).json({ error: 'Failed to create inventory' });
    }
}));
// Get all inventories
inventoryRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inventories = yield inventory_1.default.findAll({
            include: {
                model: product_1.default,
                attributes: ['id', 'name'] // Adjust attributes as needed
            }
        });
        const inventoryOutput = inventories.map(inventory => inventory.get({ plain: true }));
        res.status(200).json(inventoryOutput);
    }
    catch (error) {
        console.error('Error fetching inventories:', error);
        res.status(500).json({ error: 'Failed to fetch inventories' });
    }
}));
// Get an inventory by ID
inventoryRouter.get('/:inventory_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { inventory_id } = req.params;
        const inventory = yield inventory_1.default.findByPk(inventory_id, {
            include: {
                model: product_1.default,
                attributes: ['id', 'name'] // Adjust attributes as needed
            }
        });
        if (inventory) {
            const inventoryOutput = inventory.get({ plain: true });
            res.status(200).json(inventoryOutput);
        }
        else {
            res.status(404).json({ error: 'Inventory not found' });
        }
    }
    catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
}));
// Update an inventory by ID
inventoryRouter.patch('/:inventory_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { inventory_id } = req.params;
        const { product_id, quantity, warehouse_location, restock_date } = req.body;
        // Basic validation
        if (!product_id && !quantity && !warehouse_location && !restock_date) {
            return res.status(400).json({ error: 'At least one field is required to update' });
        }
        const [updated] = yield inventory_1.default.update({
            product_id,
            quantity,
            warehouse_location,
            restock_date
        }, {
            where: { inventory_id },
            returning: true
        });
        if (updated) {
            const updatedInventory = yield inventory_1.default.findByPk(inventory_id);
            if (updatedInventory) {
                const inventoryOutput = updatedInventory.get({ plain: true });
                res.status(200).json(inventoryOutput);
            }
            else {
                res.status(404).json({ error: 'Inventory not found' });
            }
        }
        else {
            res.status(404).json({ error: 'Inventory not found' });
        }
    }
    catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Failed to update inventory' });
    }
}));
// Delete an inventory by ID
inventoryRouter.delete('/:inventory_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { inventory_id } = req.params;
        const deleted = yield inventory_1.default.destroy({
            where: { inventory_id }
        });
        if (deleted) {
            res.status(204).send();
        }
        else {
            res.status(404).json({ error: 'Inventory not found' });
        }
    }
    catch (error) {
        console.error('Error deleting inventory:', error);
        res.status(500).json({ error: 'Failed to delete inventory' });
    }
}));
exports.default = inventoryRouter;
