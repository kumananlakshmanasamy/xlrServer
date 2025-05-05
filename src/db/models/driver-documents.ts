
import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../config';
import Driver from './driver';

interface DriverDocsAttributes {
    doc_id: number;
    driver_id: number;
    doc_type: string;
    front_image: string;
    back_image: string;
    doc_number: string;
    status: boolean;
}

export interface DriverDocsInput extends Optional<DriverDocsAttributes, 'doc_id'> {}
export interface DriverDocsOutput extends Required<DriverDocsAttributes> {}

class DriverDocs extends Model<DriverDocsAttributes, DriverDocsInput> implements DriverDocsAttributes {
    public doc_id!: number;
    public driver_id!: number;
    public doc_type!: string;
    public front_image!: string;
    public back_image!: string;
    public doc_number!: string;
    public status!: boolean;
}

DriverDocs.init({
    doc_id: {
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
    doc_type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    front_image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    back_image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    doc_number: {
        type: DataTypes.STRING(50),
        unique: true
    },
    status: {
        type: DataTypes.BOOLEAN
    }
}, {
    sequelize: sequelizeConnection,
    tableName: 'driver_docs',

});

export default DriverDocs;
