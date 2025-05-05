"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class Driver extends sequelize_1.Model {
}
Driver.init({
    driver_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    driver_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    gender: {
        type: sequelize_1.DataTypes.STRING(1)
    },
    dob: {
        type: sequelize_1.DataTypes.DATE
    },
    vehicle_type: {
        type: sequelize_1.DataTypes.STRING(50)
    },
    vehicle_number: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(15),
        allowNull: false,
        unique: true
    },
    active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: sequelize_1.DataTypes.STRING, // Change to string type
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'driver_tbl',
    indexes: [
        {
            unique: true,
            name: 'driverId_index',
            fields: ['driver_id']
        }
    ]
});
exports.default = Driver;
