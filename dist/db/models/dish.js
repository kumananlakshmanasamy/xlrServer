"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Adjust the path to your sequelize instance
const image_1 = __importDefault(require("./image")); // Adjust the path to your Image model
class Dish extends sequelize_1.Model {
}
Dish.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    restaurant_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'restaurants',
            key: 'id'
        }
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    image_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'images',
            key: 'image_id'
        }
    },
}, {
    sequelize: config_1.default,
    modelName: 'Dish',
    tableName: 'dishes',
    timestamps: true,
    indexes: [
        {
            unique: true,
            name: 'dishesId_index',
            fields: ['id']
        }
    ]
});
Dish.belongsTo(image_1.default, { foreignKey: 'image_id', as: 'image' });
exports.default = Dish;
