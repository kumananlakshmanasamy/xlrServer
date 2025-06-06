"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/vehicleBooking.ts
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const xlrUser_1 = __importDefault(require("./xlrUser"));
const Vehicles_1 = __importDefault(require("./Vehicles"));
const driver_1 = __importDefault(require("./driver"));
class vehicleBooking extends sequelize_1.Model {
}
vehicleBooking.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: xlrUser_1.default,
            key: 'id'
        }
    },
    driver_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: driver_1.default,
            key: 'driver_id' // Ensure this matches the user model primary key
        }
    },
    vehicle_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // Make this field optional
        references: {
            model: Vehicles_1.default,
            key: 'id' // Ensure this matches the vehicle model primary key
        }
    },
    pickup_address: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    dropoff_address: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    goods_type: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false
    },
    total_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    sender_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false
    },
    sender_phone: {
        type: sequelize_1.DataTypes.STRING(15),
        allowNull: false
    },
    receiver_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false
    },
    receiver_phone: {
        type: sequelize_1.DataTypes.STRING(15),
        allowNull: false
    },
    vehicle_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true
    },
    vehicle_image: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    payment_method: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true
    },
    // Add more fields as needed...
    status: {
        type: sequelize_1.DataTypes.ENUM('completed', 'pending', 'cancelled', 'In progress'),
        allowNull: false,
        defaultValue: 'pending'
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'vehicleBooking',
});
exports.default = vehicleBooking;
