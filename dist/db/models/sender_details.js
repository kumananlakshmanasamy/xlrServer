"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/senderDetails.ts
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const users_1 = __importDefault(require("./users")); // Import the User model for reference
class SenderDetails extends sequelize_1.Model {
}
SenderDetails.init({
    sender_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sender_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false
    },
    mobile_number: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: users_1.default, // Reference to User model
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    address: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    address_type: {
        type: sequelize_1.DataTypes.ENUM('Home', 'Shop', 'Other'),
        allowNull: false
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'sender_details',
    indexes: [
        {
            unique: true,
            name: 'senderId_index',
            fields: ['sender_id']
        }
    ]
});
// Set up the association if needed
// SenderDetails.belongsTo(User, {
//     foreignKey: 'user_id',
//     as: 'user'
// });
exports.default = SenderDetails;
