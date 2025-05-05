"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const users_1 = __importDefault(require("./users"));
const driver_1 = __importDefault(require("./driver"));
const servicetype_1 = __importDefault(require("./servicetype"));
const booking_1 = __importDefault(require("./booking"));
const recieverdetails_1 = __importDefault(require("./recieverdetails"));
class RideRequest extends sequelize_1.Model {
}
RideRequest.init({
    request_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: users_1.default,
            key: 'id'
        }
    },
    driver_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: driver_1.default,
            key: 'driver_id'
        }
    },
    service_type_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: servicetype_1.default,
            key: 'service_id'
        }
    },
    receiver_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: recieverdetails_1.default,
            key: 'receiver_id'
        }
    },
    booking_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: booking_1.default,
            key: 'booking_id'
        }
    },
    status: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false
    },
    is_deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: true,
    sequelize: config_1.default,
    tableName: 'ride_request_tbl',
    indexes: [
        {
            unique: true,
            name: 'requestId_index',
            fields: ['request_id']
        },
        {
            unique: false,
            name: 'requestId_index',
            fields: ['user_id']
        }
    ]
});
exports.default = RideRequest;
