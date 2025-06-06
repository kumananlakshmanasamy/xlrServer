"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    gender: {
        type: sequelize_1.DataTypes.STRING(1)
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(15),
        allowNull: false,
        unique: true,
    },
    profile_image: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    fcm_token: {
        type: sequelize_1.DataTypes.STRING(255), // Define FCM token attribute
        allowNull: true,
        unique: true,
    },
    active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    title: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'new user Registered' // Set default value for title
    },
    notification_status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true // Define default value for notification_status
    },
    type: {
        type: sequelize_1.DataTypes.STRING, // Specify the type as STRING
        allowNull: false, // You can change this to false if it's a required field
        defaultValue: 'user'
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'User_tbl',
    indexes: [
        {
            unique: true,
            name: 'userId_index',
            fields: ['id']
        }
    ]
    // Add afterCreate hook to notify admin
});
// // Add afterCreate hook to notify admin
// User.afterCreate(async (user: User) => {
//     await notifyAdminOnUserRegistration(user);  // Call the separate event handler
// });
exports.default = User;
