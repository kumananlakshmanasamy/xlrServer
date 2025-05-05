"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Ensure this imports your sequelize instance
class SuperCategory extends sequelize_1.Model {
}
SuperCategory.init({
    super_category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'super_categories',
    indexes: [
        {
            unique: true,
            name: 'superCategoryId_index',
            fields: ['super_category_id']
        }
    ]
});
exports.default = SuperCategory;
