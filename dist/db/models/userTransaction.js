"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Adjust the path as needed
const users_1 = __importDefault(require("./users"));
// Define the Transaction model
class Transaction extends sequelize_1.Model {
}
// Initialize the model
Transaction.init({
    transaction_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: users_1.default, // Make sure the table name is correct
            key: 'id'
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
    reference_id: {
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
    tableName: 'userTransactions',
    timestamps: true,
    indexes: [
        {
            unique: false,
            name: 'transactionUserId_index',
            fields: ['user_id']
        }
    ]
});
exports.default = Transaction;
