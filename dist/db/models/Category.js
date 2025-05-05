"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Ensure this imports your sequelize instance
const SuperCategory_1 = __importDefault(require("./SuperCategory")); // Ensure the correct path to the SuperCategory model
const image_1 = __importDefault(require("./image"));
class Category extends sequelize_1.Model {
}
Category.init({
    category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    super_category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: SuperCategory_1.default,
            key: 'super_category_id'
        },
        allowNull: false
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    image_id: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: image_1.default,
            key: 'image_id'
        },
        allowNull: true
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'categories',
    indexes: [
        {
            unique: true,
            name: 'categoryId_index',
            fields: ['category_id']
        }
    ]
});
Category.belongsTo(SuperCategory_1.default, { foreignKey: 'super_category_id', as: 'superCategory' });
Category.belongsTo(image_1.default, { foreignKey: 'image_id', as: 'image' });
exports.default = Category;
