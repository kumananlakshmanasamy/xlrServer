"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Adjust the path as necessary
// Define the Image class
class Image extends sequelize_1.Model {
}
// Initialize the Image model
Image.init({
    image_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    entity_type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Category', 'SubCategory', 'brand', 'product', 'restaurant', 'dish', 'inventory']],
        },
    },
    entity_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    image_url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    alt_text: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: config_1.default,
    tableName: 'images',
    timestamps: true,
    indexes: [
        {
            unique: true,
            name: 'imageId_index',
            fields: ['image_id']
        }
    ]
});
exports.default = Image;
