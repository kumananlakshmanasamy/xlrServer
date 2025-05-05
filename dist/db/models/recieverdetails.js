"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/receiverDetails.ts
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const users_1 = __importDefault(require("./users")); // Import the User model
class ReceiverDetails extends sequelize_1.Model {
}
ReceiverDetails.init({
    receiver_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    receiver_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false
    },
    receiver_phone_number: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: users_1.default,
            key: 'id' // Key in the target model that the foreign key refers to
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'receiver_details',
    indexes: [
        {
            unique: true,
            name: 'receiverId_index',
            fields: ['receiver_id']
        }
    ]
});
// Set up the association
// ReceiverDetails.belongsTo(User, {
//     foreignKey: 'user_id',
//     as: 'user'
// });
exports.default = ReceiverDetails;
