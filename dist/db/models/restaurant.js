"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Adjust the path to your sequelize instance
const image_1 = __importDefault(require("../models/image")); // Adjust the path to your Image model
class Restaurant extends sequelize_1.Model {
}
Restaurant.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    rating: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    opening_time: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    closing_time: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    image_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: image_1.default,
            key: 'image_id',
        },
    },
}, {
    sequelize: config_1.default,
    modelName: 'Restaurant',
    tableName: 'restaurants',
    timestamps: true,
    indexes: [
        {
            unique: true,
            name: 'restaurantId_index',
            fields: ['id']
        }
    ]
});
// Define the association
Restaurant.belongsTo(image_1.default, { foreignKey: 'image_id', as: 'image' });
exports.default = Restaurant;
