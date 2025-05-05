import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../config'; // adjust path if needed

interface XlrUserAttributes {
    id: number;
    fullname: string;
    email: string;
    password: string;
    phone: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Input type for creation (id is optional when creating)
export interface XlrUserInput extends Optional<XlrUserAttributes, 'id'> {}

// Output type for retrieved data (everything required)
export interface XlrUserOutput extends Required<XlrUserAttributes> {}

class XlrUser extends Model<XlrUserAttributes, XlrUserInput> implements XlrUserAttributes {
    public id!: number;
    public fullname!: string;
    public email!: string;
    public password!: string;
    public phone!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

XlrUser.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        fullname: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize: sequelizeConnection,
        timestamps: true,
        tableName: 'XlrUsers', // use 'XlrUsers' instead of 'XlrUser_tbl' (common practice)
    }
);

export default XlrUser;
