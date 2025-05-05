"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class Promotion extends sequelize_1.Model {
}
Promotion.init({
    promotion_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    promotion_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.TEXT
    },
    promotion_type: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false
    },
    start_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    discount_amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2)
    },
    discount_percentage: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2)
    },
    eligibility_criteria: {
        type: sequelize_1.DataTypes.TEXT
    },
    usage_limit: {
        type: sequelize_1.DataTypes.INTEGER
    },
    promotion_code: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    associated_campaign: {
        type: sequelize_1.DataTypes.STRING(255)
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'promotions',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
        {
            unique: true,
            name: 'promotionId_index',
            fields: ['promotion_id']
        }
    ]
});
exports.default = Promotion;
