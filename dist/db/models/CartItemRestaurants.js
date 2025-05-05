"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const dish_1 = __importDefault(require("./dish"));
const restaurant_1 = __importDefault(require("./restaurant"));
const image_1 = __importDefault(require("./image"));
class CartItemRest extends sequelize_1.Model {
    // Calculate total price based on quantity and dish price
    calculateTotalPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            const dish = yield dish_1.default.findByPk(this.dish_id);
            if (dish) {
                this.totalPrice = dish.price * this.quantity; // Assuming 'price' is a field in Dish model
            }
        });
    }
}
CartItemRest.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    dish_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: dish_1.default,
            key: 'id',
        },
    },
    restaurant_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: restaurant_1.default,
            key: 'id',
        },
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    totalPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true, // Can be null initially, updated when the item is created or updated
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false, // Default to false
    },
    image_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'images',
            key: 'image_id'
        }
    },
}, {
    sequelize: config_1.default,
    modelName: 'CartItemRest',
    tableName: 'CartItemRest',
    timestamps: true,
});
// Update totalPrice on save
CartItemRest.beforeSave((CartItemRest) => __awaiter(void 0, void 0, void 0, function* () {
    if (!CartItemRest.is_deleted) { // Only calculate if not deleted
        yield CartItemRest.calculateTotalPrice();
    }
}));
CartItemRest.belongsTo(dish_1.default, { foreignKey: 'dish_id' });
CartItemRest.belongsTo(restaurant_1.default, { foreignKey: 'restaurant_id' });
CartItemRest.belongsTo(image_1.default, { foreignKey: 'image_id', as: "image" });
exports.default = CartItemRest;
