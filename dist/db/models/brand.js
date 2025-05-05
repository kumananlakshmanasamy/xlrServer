"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Adjust the path to your sequelize instance
// Extend the Model class from Sequelize to create a Brand model
class Brand extends sequelize_1.Model {
}
// Initialize the Brand model
Brand.init({
    brand_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Assuming you want the ID to auto-increment
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    image_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'images',
            key: 'image_id'
        }
    },
}, {
    sequelize: config_1.default,
    modelName: 'Brand',
    tableName: 'brands',
    timestamps: true,
    indexes: [
        {
            unique: true,
            name: 'brandId_index',
            fields: ['brand_id']
        }
    ]
});
// Export the Brand model
exports.default = Brand;
