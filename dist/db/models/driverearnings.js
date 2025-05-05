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
const driver_1 = __importDefault(require("./driver")); // Ensure the path is correct
const riderequest_1 = __importDefault(require("./riderequest")); // Ensure the path is correct
const sequelize_2 = require("sequelize");
class DriverEarnings extends sequelize_1.Model {
}
DriverEarnings.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    driver_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: driver_1.default,
            key: 'driver_id',
        },
    },
    request_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: riderequest_1.default,
            key: 'request_id',
        },
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        get() {
            const rawValue = this.getDataValue('date');
            return rawValue instanceof Date ? rawValue : new Date(rawValue);
        },
    },
    earnings: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    daily_earnings: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    monthly_earnings: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: config_1.default,
    modelName: 'DriverEarnings',
    tableName: 'driver_earnings',
    timestamps: true,
    indexes: [
        {
            unique: false,
            name: 'earningDriverId_index',
            fields: ['driver_id']
        },
        {
            unique: true,
            name: 'earningDriverId_index',
            fields: ['id']
        }
    ],
    hooks: {
        beforeSave: (driverEarnings) => __awaiter(void 0, void 0, void 0, function* () {
            // Compute daily earnings
            const year = driverEarnings.date.getFullYear();
            const month = driverEarnings.date.getMonth();
            const day = driverEarnings.date.getDate();
            const startOfDay = new Date(year, month, day, 0, 0, 0);
            const endOfDay = new Date(year, month, day, 23, 59, 59);
            // Get total earnings for the driver on the same day
            const dailyEarnings = yield DriverEarnings.sum('earnings', {
                where: {
                    driver_id: driverEarnings.driver_id,
                    date: {
                        [sequelize_2.Op.between]: [startOfDay, endOfDay],
                    },
                },
            });
            driverEarnings.daily_earnings = (dailyEarnings || 0) + driverEarnings.earnings;
            // Compute monthly earnings
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
            const monthlyEarnings = yield DriverEarnings.sum('earnings', {
                where: {
                    driver_id: driverEarnings.driver_id,
                    date: {
                        [sequelize_2.Op.between]: [startOfMonth, endOfMonth],
                    },
                },
            });
            driverEarnings.monthly_earnings = (monthlyEarnings || 0) + driverEarnings.earnings;
        }),
    },
});
exports.default = DriverEarnings;
