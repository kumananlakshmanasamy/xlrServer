"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//productModel.ts
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config")); // Adjust the path to your sequelize instance
const SubCategory_1 = __importDefault(require("./SubCategory"));
const brand_1 = __importDefault(require("./brand"));
const image_1 = __importDefault(require("./image"));
class Product extends sequelize_1.Model {
}
Product.init({
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    sub_category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SubCategory_1.default,
            key: 'sub_category_id'
        }
    },
    brand_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: brand_1.default,
            key: 'brand_id'
        }
    },
    image_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: image_1.default,
            key: 'image_id'
        }
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    discount_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    is_available: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
}, {
    sequelize: config_1.default,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    indexes: [
        {
            unique: true,
            name: 'productId_index',
            fields: ['product_id']
        }
    ]
});
Product.belongsTo(SubCategory_1.default, { foreignKey: 'sub_category_id', as: 'subCategory' });
Product.belongsTo(brand_1.default, { foreignKey: 'brand_id', as: 'brand' });
Product.belongsTo(image_1.default, { foreignKey: 'image_id', as: 'image' });
exports.default = Product;
