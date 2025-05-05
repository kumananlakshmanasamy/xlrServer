"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Adjust the path as necessary
const users_1 = __importDefault(require("./users")); // Adjust the path to the User model as necessary
const restaurant_1 = __importDefault(require("./restaurant")); // Assuming you have a Restaurant model
const Address_1 = __importDefault(require("./Address")); // Assuming you have an Address model
// Define the Order class
class Order extends sequelize_1.Model {
}
// Initialize the Order model
Order.init({
    order_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: users_1.default,
            key: 'id',
        },
    },
    restaurant_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: restaurant_1.default,
            key: 'id',
        },
    },
    address_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Address_1.default,
            key: 'address_id',
        },
    },
    total_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    order_status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'completed', 'cancelled'),
        allowNull: false,
    },
    payment_method: {
        type: sequelize_1.DataTypes.ENUM('cash_on_delivery', 'online'),
        allowNull: false,
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
    tableName: 'orders',
    timestamps: true,
    underscored: true,
});
Order.belongsTo(users_1.default, { foreignKey: 'user_id' });
users_1.default.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(restaurant_1.default, { foreignKey: 'restaurant_id' });
Order.belongsTo(Address_1.default, { foreignKey: 'address_id' });
exports.default = Order;
