"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // adjust the path to your Sequelize instance
// Define the Vehicle model
class Vehicle extends sequelize_1.Model {
}
// Initialize the model
Vehicle.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    capacity: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true, // Allow image to be null
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
}, {
    sequelize: config_1.default,
    tableName: 'vehicles',
    timestamps: true,
});
exports.default = Vehicle;
