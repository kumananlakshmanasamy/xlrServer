
import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../config';


interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    gender?: string;
    phone: string;
    profile_image?: string;
    active: boolean;
    is_deleted: boolean;
    fcm_token?: string;  // Add FCM token attribute
    title: string;  // Add title attribute
    notification_status: boolean;  // Add notification_status attribute
    type?:string; // Add type attribute
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserInput extends Optional<UserAttributes, 'id'> {}
export interface UserOutput extends Required<UserAttributes> {}

class User extends Model<UserAttributes, UserInput> implements UserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public password!: string;
    public gender!: string;
    public phone!: string;
    public profile_image!: string;
    public active!: boolean;
    public is_deleted!: boolean;
    public fcm_token!: string;  // Add FCM token attribute
    public title!: string;  // Add title attribute
    public notification_status!: boolean;  // Add notification_status attribute
    public type!:string; // Add type attribute
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING(1)
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
    },
    profile_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    fcm_token: {
        type: DataTypes.STRING(255), // Define FCM token attribute
        allowNull: true,
        unique: true,
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'new user Registered'  // Set default value for title
    },
    notification_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true  // Define default value for notification_status
    },
    type: {  // Correct syntax for adding type attribute
        type: DataTypes.STRING,  // Specify the type as STRING
        allowNull: false,// You can change this to false if it's a required field
        defaultValue:'user'
    }
}, {
    timestamps: true,
    sequelize: sequelizeConnection,
    tableName: 'User_tbl',
    indexes: [
        {
            unique: true,
            name: 'userId_index',
            fields: ['id']
        }
    ]

// Add afterCreate hook to notify admin

});

// // Add afterCreate hook to notify admin
// User.afterCreate(async (user: User) => {
//     await notifyAdminOnUserRegistration(user);  // Call the separate event handler
// });

export default User;
