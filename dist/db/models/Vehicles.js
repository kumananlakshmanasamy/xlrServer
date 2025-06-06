"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Adjust the path to your Sequelize instance
const image_1 = __importDefault(require("./image")); // Adjust the path to your Image model
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
    image_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: image_1.default,
            key: 'image_id', // Ensure this matches the primary key of the Image model
        },
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    baseFare: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    ratePerKm: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    estimatedTimePerKm: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    sequelize: config_1.default,
    tableName: 'ShipEasevehicles',
    timestamps: true,
});
// Associate the Vehicle model with the Image model
Vehicle.belongsTo(image_1.default, { foreignKey: 'image_id', as: 'image' });
exports.default = Vehicle;
