import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

interface DriverAttributes {
    driver_id: number;
    driver_name: string;
    email: string;
    password: string;
    gender?: string;
    dob?: Date;
    vehicle_type?: string;
    vehicle_number: string;
    phone: string;
    active: boolean;
    is_deleted: boolean;
    status: boolean; // Updated to string type
    profile_image?: string;  // New field for profile image
    title: string;  // Add title attribute
    notification_status: boolean;  // Add notification_status attribute
    type?:string;
    document_status: 'pending' | 'under_verification' | 'approved';  // New field
    createdAt?: Date;
    updatedAt?: Date;
}

export interface DriverInput extends Optional<DriverAttributes, 'driver_id'> {}
export interface DriverOutput extends Required<DriverAttributes> {}

class Driver extends Model<DriverAttributes, DriverInput> implements DriverAttributes {
    public driver_id!: number;
    public driver_name!: string;
    public email!: string;
    public password!: string;
    public gender!: string;
    public dob!: Date;
    public vehicle_type!: string;
    public vehicle_number!: string;
    public phone!: string;
    public active!: boolean;
    public is_deleted!: boolean;
    public status!: boolean;  // Updated to string type
    public profile_image!: string;  // New field for storing image URL
    public title!: string;  // Add title attribute
    public notification_status!: boolean;  // Add notification_status attribute
    public type!:string; // Add type attribute
    public document_status!: 'pending' | 'under_verification' | 'approved';  // New attribute



    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Removed unnecessary properties
}

Driver.init({
    driver_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    driver_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING(6), // Allow up to 6 characters for gender (e.g., "Male", "Female")
        allowNull: true
    },
    dob: {
        type: DataTypes.DATE
    },
    vehicle_type: {
        type: DataTypes.STRING(50)
    },
    vehicle_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false  
    },
    profile_image: {
        type: DataTypes.STRING,  // New field for storing image URL
        allowNull: true          // Optional field     
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'new driver Registered'  // Set default value for title
    },
    notification_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true  // Define default value for notification_status
    },
    type: {  // Correct syntax for adding type attribute
        type: DataTypes.STRING,  // Specify the type as STRING
         allowNull: false ,// You can change this to false if it's a required field
        defaultValue: 'driver' 
    },
    document_status: {
        type: DataTypes.ENUM("pending", "under_verification", "approved"),  // Enum field
        allowNull: false,
        defaultValue: "pending",  // Default value
    },
}, {
    timestamps: true,
    sequelize: sequelizeConnection,
    tableName: 'driver_tbl',
    indexes: [
        {
            unique: true,
            name: 'driverId_index',
            fields: ['driver_id']
        }
    ]
});

export default Driver;