"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/driverLocation.ts
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const driver_1 = __importDefault(require("./driver"));
class DriverLocation extends sequelize_1.Model {
}
DriverLocation.init({
    location_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    driver_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: driver_1.default,
            key: 'driver_id'
        }
    },
    latitude: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false
    },
    longitude: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: config_1.default,
    tableName: 'driver_location'
});
exports.default = DriverLocation;
