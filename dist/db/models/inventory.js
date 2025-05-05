"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Adjust the path to your sequelize instance
const product_1 = __importDefault(require("./product")); // Adjust the path to your Product model
class Inventory extends sequelize_1.Model {
}
Inventory.init({
    inventory_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'product_id'
        }
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    warehouse_location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    restock_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: config_1.default,
    modelName: 'Inventory',
    tableName: 'inventories',
    timestamps: true,
    indexes: [
        {
            unique: true,
            name: 'inventoryId_index',
            fields: ['inventory_id']
        },
        {
            unique: false,
            name: 'inventoryId_index',
            fields: ['product_id']
        }
    ]
});
Inventory.belongsTo(product_1.default, { foreignKey: 'product_id' });
exports.default = Inventory;
