"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Update this path as needed
const users_1 = __importDefault(require("./users"));
const promotions_1 = __importDefault(require("./promotions"));
const product_1 = __importDefault(require("./product"));
class AddToCart extends sequelize_1.Model {
}
AddToCart.init({
    cart_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: users_1.default,
            key: 'id'
        }
    },
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: product_1.default,
            key: 'product_id'
        }
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false
    },
    total_price: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    promotion_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: promotions_1.default,
            key: 'promotion_id'
        }
    },
    // delivery_fee: {
    //     type: DataTypes.FLOAT,
    //     allowNull: true
    // },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    paranoid: true,
    sequelize: config_1.default,
    tableName: 'cart_items',
    indexes: [
        {
            unique: false,
            name: 'cart_userId_index',
            fields: ['user_id']
        }
    ]
});
exports.default = AddToCart;
