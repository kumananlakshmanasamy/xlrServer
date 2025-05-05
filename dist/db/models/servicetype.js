"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/serviceType.ts
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class ServiceType extends sequelize_1.Model {
}
ServiceType.init({
    service_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    service_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false
    }
}, {
    sequelize: config_1.default,
    tableName: 'service_type',
});
exports.default = ServiceType;
