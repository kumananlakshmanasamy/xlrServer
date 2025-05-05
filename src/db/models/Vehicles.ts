import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config'; // Adjust the path to your Sequelize instance
import Image from './image'; // Adjust the path to your Image model

// Define attributes for the Vehicle model
interface VehicleAttributes {
    id: number;
    name: string;
    capacity: string;
    image_id?: number; // This is the foreign key for the image
    price: number; // Static price, can be ignored in your calculations
    baseFare: number; // Base fare for the vehicle
    ratePerKm: number; // Rate per kilometer for the vehicle
    estimatedTimePerKm: number; // Estimated time per km (in minutes)
    createdAt?: Date;
    updatedAt?: Date;
}

// Define input and output types
export interface VehicleInput extends Optional<VehicleAttributes, 'id'> {}
export interface VehicleOutput extends Required<VehicleAttributes> {
    image?: Image; // This indicates the associated image
}

// Define the Vehicle model
class Vehicle extends Model<VehicleAttributes, VehicleInput> implements VehicleAttributes {
    public id!: number;
    public name!: string;
    public capacity!: string;
    public image_id?: number; // Foreign key to the Image model
    public price!: number;
    public baseFare!: number;
    public ratePerKm!: number;
    public estimatedTimePerKm!: number;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Include the image association
    public readonly image?: Image; // This will hold the associated Image instance
    image_url: any;
}

// Initialize the model
Vehicle.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        capacity: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Image,
                key: 'image_id', // Ensure this matches the primary key of the Image model
            },
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        baseFare: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        ratePerKm: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        estimatedTimePerKm: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'ShipEasevehicles',
        timestamps: true,
    }
);

// Associate the Vehicle model with the Image model
Vehicle.belongsTo(Image, { foreignKey: 'image_id', as: 'image' });

export default Vehicle;
