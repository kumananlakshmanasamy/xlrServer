// models/driverLocation.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../config';
import Driver from './driver';

interface DriverLocationAttributes {
    location_id: number;
    driver_id: number;
    latitude: string;
    longitude: string;
    timestamp?: Date;
}

export interface DriverLocationInput extends Optional<DriverLocationAttributes, 'location_id'> {}
export interface DriverLocationOutput extends Required<DriverLocationAttributes> {}

class DriverLocation extends Model<DriverLocationAttributes, DriverLocationInput> implements DriverLocationAttributes {
    public location_id!: number;
    public driver_id!: number;
    public latitude!: string;
    public longitude!: string;

    public readonly timestamp!: Date;
}

DriverLocation.init({
    location_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    driver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Driver,
            key: 'driver_id'
        }
    },
    latitude: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    longitude: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize: sequelizeConnection,
    tableName: 'driver_location'
});

export default DriverLocation;
