"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbHost = process.env.RDS_HOSTNAME;
const dbPort = process.env.RDS_PORT;
const dbName = process.env.RDS_DB_NAME;
const dbUser = process.env.RDS_USERNAME;
const dbDriver = process.env.DB_DRIVER;
const dbPassword = process.env.RDS_PASSWORD;
function getConnection() {
    console.log(dbHost);
    if (!dbHost || !dbPort || !dbName || !dbUser || !dbDriver || !dbPassword) {
        throw new Error('Missing required database environment variables');
    }
    return new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: parseInt(dbPort || '5432'),
        dialect: dbDriver,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // For self-signed certificates
            }
        }
    });
}
const sequelizeConnection = getConnection();
if (sequelizeConnection) {
    console.log('Database connection established successfully');
}
exports.default = sequelizeConnection;
