"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class OTP extends sequelize_1.Model {
}
OTP.init({
    phone: {
        type: sequelize_1.DataTypes.STRING(15),
        primaryKey: true,
    },
    otp: {
        type: sequelize_1.DataTypes.STRING(6),
        allowNull: false,
    },
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'otps',
});
exports.default = OTP;
