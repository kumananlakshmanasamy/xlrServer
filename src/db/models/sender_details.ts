// models/senderDetails.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../config';
import User from './users';  // Import the User model for reference

interface SenderDetailsAttributes {
    sender_id: number;
    sender_name: string;
    mobile_number: string;
    user_id: number;
    address: string;
    address_type: 'Home' | 'Shop' | 'Other';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SenderDetailsInput extends Optional<SenderDetailsAttributes, 'sender_id'> {}
export interface SenderDetailsOutput extends Required<SenderDetailsAttributes> {}

class SenderDetails extends Model<SenderDetailsAttributes, SenderDetailsInput> implements SenderDetailsAttributes {
    public sender_id!: number;
    public sender_name!: string;
    public mobile_number!: string;
    public user_id!: number;
    public address!: string;  // Add address to class properties
    public address_type!: 'Home' | 'Shop' | 'Other';  // Add address_type to class properties

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SenderDetails.init({
    sender_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sender_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    mobile_number: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,  // Reference to User model
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    address_type: {
        type: DataTypes.ENUM('Home', 'Shop', 'Other'),
        allowNull: false
    }
}, {
    timestamps: true,
    sequelize: sequelizeConnection,
    tableName: 'sender_details',
    indexes: [
        {
            unique: true,
            name: 'senderId_index',
            fields: ['sender_id']
        }
    ]
});

// Set up the association if needed
// SenderDetails.belongsTo(User, {
//     foreignKey: 'user_id',
//     as: 'user'
// });

export default SenderDetails;
