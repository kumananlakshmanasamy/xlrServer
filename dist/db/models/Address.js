"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const users_1 = __importDefault(require("./users"));
class Address extends sequelize_1.Model {
}
Address.init({
    address_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    house_number: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    apartment: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    landmark: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: users_1.default,
            key: 'id'
        }
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('Home', 'Work', 'Other'),
        allowNull: false
    },
    city: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    state: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    zipcode: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true
    },
    country: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    alternative_phone_number: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'address',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
        {
            unique: false,
            name: 'address_userId_index',
            fields: ['user_id']
        },
        {
            unique: true,
            name: 'address_userId_index',
            fields: ['address_id']
        }
    ]
});
exports.default = Address;
