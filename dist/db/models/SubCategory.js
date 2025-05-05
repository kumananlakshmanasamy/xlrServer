"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//SubCategoryModel.ts
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Ensure this imports your sequelize instance
const Category_1 = __importDefault(require("./Category"));
const image_1 = __importDefault(require("./image"));
class SubCategory extends sequelize_1.Model {
}
SubCategory.init({
    sub_category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Category_1.default,
            key: 'category_id'
        }
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
        allowNull: false,
        references: {
            model: image_1.default,
            key: 'image_id'
        }
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'sub_categories',
    indexes: [
        {
            unique: true,
            name: 'subCategoryId_index',
            fields: ['sub_category_id']
        }
    ]
});
SubCategory.belongsTo(Category_1.default, { foreignKey: 'category_id', as: 'category' });
SubCategory.belongsTo(image_1.default, { foreignKey: 'image_id', as: 'image' });
exports.default = SubCategory;
