import { Dialect, Sequelize } from 'sequelize';
import dotenv from 'dotenv'
dotenv.config();


const dbHost = process.env.RDS_HOSTNAME;
const dbPort = process.env.RDS_PORT;
const dbName = process.env.RDS_DB_NAME as string;
const dbUser = process.env.RDS_USERNAME as string;
const dbDriver = process.env.DB_DRIVER as Dialect;
const dbPassword = process.env.RDS_PASSWORD as string;

function getConnection() {
    console.log(dbHost)
    if (!dbHost || !dbPort || !dbName || !dbUser || !dbDriver || !dbPassword) {
        throw new Error('Missing required database environment variables');
    }

    return new Sequelize(dbName, dbUser, dbPassword, {
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

if(sequelizeConnection){
    console.log('Database connection established successfully');
}

export default sequelizeConnection;
