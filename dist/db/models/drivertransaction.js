"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Adjust the path as needed
const driver_1 = __importDefault(require("./driver")); // Adjust the path to the driver model
const riderequest_1 = __importDefault(require("./riderequest")); // Adjust the path to the rideRequest model
// Define the DriverTransaction model
class DriverTransaction extends sequelize_1.Model {
}
// Initialize the model
DriverTransaction.init({
    transaction_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    driver_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: driver_1.default,
            key: 'driver_id'
        }
    },
    request_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: riderequest_1.default,
            key: 'request_id'
        }
    },
    wallet_balance_before: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    wallet_balance_after: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    transaction_type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['credit', 'debit']],
        }
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    transaction_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    }
}, {
    sequelize: config_1.default,
    tableName: 'driverTransactions',
    timestamps: true,
});
exports.default = DriverTransaction;
