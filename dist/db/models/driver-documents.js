"use strict";
// models/driverDocs.ts
// import { DataTypes, Model, Optional } from 'sequelize';
// import sequelizeConnection from '../config';
// import Driver from './driver';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// interface DriverDocsAttributes {
//     doc_id: number;
//     driver_id: number;
//     doc_type: string;
//     front_image: Buffer;
//     back_image: Buffer;
//     doc_number: string;
//     status: boolean;
// }
// export interface DriverDocsInput extends Optional<DriverDocsAttributes, 'doc_id'> {}
// export interface DriverDocsOutput extends Required<DriverDocsAttributes> {}
// class DriverDocs extends Model<DriverDocsAttributes, DriverDocsInput> implements DriverDocsAttributes {
//     public doc_id!: number;
//     public driver_id!: number;
//     public doc_type!: string;
//     public front_image!: Buffer;
//     public back_image!: Buffer;
//     public doc_number!: string;
//     public status!: boolean;
// }
// DriverDocs.init({
//     doc_id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     driver_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//             model: Driver,
//             key: 'driver_id'
//         }
//     },
//     doc_type: {
//         type: DataTypes.STRING(50),
//         allowNull: false
//     },
//     front_image: {
//         type: DataTypes.BLOB
//     },
//     back_image: {
//         type: DataTypes.BLOB
//     },
//     doc_number: {
//         type: DataTypes.STRING(50),
//         unique: true
//     },
//     status: {
//         type: DataTypes.BOOLEAN
//     }
// }, {
//     sequelize: sequelizeConnection,
//     tableName: 'driver_docs'
// });
// export default DriverDocs;
// models/driverDocs.ts
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
    indexes: [
        {
            unique: true,
            name: 'docsDriverId_index',
            fields: ['doc_id']
        },
        {
            unique: false,
            name: 'docsDriverId_index',
            fields: ['driver_id']
        }
    ]
});
exports.default = DriverDocs;
