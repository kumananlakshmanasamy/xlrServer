"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const driver_1 = __importDefault(require("./driver"));
class DriverDocs extends sequelize_1.Model {
}
DriverDocs.init({
    doc_id: {
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
    doc_type: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false
    },
    front_image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    back_image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    doc_number: {
        type: sequelize_1.DataTypes.STRING(50),
        unique: true
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN
    }
}, {
    sequelize: config_1.default,
    tableName: 'driver_docs',
});
exports.default = DriverDocs;
