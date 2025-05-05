"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const order_1 = __importDefault(require("./order"));
const dish_1 = __importDefault(require("./dish")); // Assuming you have a Dish model
class OrderItem extends sequelize_1.Model {
}
OrderItem.init({
    order_item_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    order_id: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: order_1.default,
            key: 'order_id',
        },
        allowNull: false,
    },
    dish_id: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: dish_1.default,
            key: 'id', // Assuming 'id' is the primary key in Dish model
        },
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    deleted_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'order_items',
});
OrderItem.belongsTo(order_1.default, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(dish_1.default, { foreignKey: 'dish_id', as: 'dish' });
exports.default = OrderItem;
