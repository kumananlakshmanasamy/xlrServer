"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentStatusLabel = exports.PaymentStatus = void 0;
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const order_1 = __importDefault(require("./order")); // Adjust the import path as needed
const userTransaction_1 = __importDefault(require("./userTransaction"));
// Enum for payment status
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus[PaymentStatus["InProgress"] = 1] = "InProgress";
    PaymentStatus[PaymentStatus["Failed"] = 2] = "Failed";
    PaymentStatus[PaymentStatus["Success"] = 3] = "Success";
})(PaymentStatus = exports.PaymentStatus || (exports.PaymentStatus = {}));
// Function to get payment status label
function getPaymentStatusLabel(status) {
    switch (status) {
        case PaymentStatus.InProgress:
            return 'InProgress';
        case PaymentStatus.Failed:
            return 'Failed';
        case PaymentStatus.Success:
            return 'Success';
        default:
            return 'Unknown';
    }
}
exports.getPaymentStatusLabel = getPaymentStatusLabel;
class Payment extends sequelize_1.Model {
    // Custom getter for payment_status
    get statusLabel() {
        return getPaymentStatusLabel(this.payment_status);
    }
}
Payment.init({
    payment_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    order_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: order_1.default,
            key: 'order_id',
        },
    },
    transaction_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        // Add reference to the Transaction model if applicable
        references: {
            model: userTransaction_1.default,
            key: 'transaction_id',
        },
    },
    payment_status: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isIn: [[PaymentStatus.InProgress, PaymentStatus.Failed, PaymentStatus.Success]], // Ensure the value is 1, 2, or 3
        },
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: config_1.default,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at',
});
// Define associations
//Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
// Uncomment and adjust if Transaction model is used
// Payment.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
exports.default = Payment;
