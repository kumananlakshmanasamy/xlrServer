"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/booking.ts
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const users_1 = __importDefault(require("./users"));
const servicetype_1 = __importDefault(require("./servicetype")); // Import the ServiceType model
class Booking extends sequelize_1.Model {
}
Booking.init({
    booking_id: {
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
    service_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: servicetype_1.default,
            key: 'service_id'
        }
    },
    pickup_address: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    dropoff_address: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'booking',
    indexes: [
        {
            unique: true,
            name: 'BookingId_index',
            fields: ['booking_id']
        }
    ]
});
exports.default = Booking;
