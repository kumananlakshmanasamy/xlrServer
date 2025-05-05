"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/admin.ts
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class Admin extends sequelize_1.Model {
}
Admin.init({
    admin_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    admin_name: {
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
    mobile_number: {
        type: sequelize_1.DataTypes.STRING(15),
        allowNull: false,
        unique: true
    },
    otp_session_id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    },
    otp_timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    admin_image: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'admin_tbl'
});
exports.default = Admin;
