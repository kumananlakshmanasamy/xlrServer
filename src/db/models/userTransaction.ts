import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config'; // Adjust the path as needed
import User from './users';

// Define attributes for the Transaction model
interface TransactionAttributes {
    transaction_id: number;
    user_id: number;
    wallet_balance_before: number;
    wallet_balance_after: number;
    amount: number;
    transaction_type: string; // TypeScript type constraint
    description?: string;
    reference_id?: string;
    transaction_date: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface userTransactionInput extends Optional<TransactionAttributes, 'transaction_id'> {}
export interface userTransactionOutput extends Required<TransactionAttributes> {}

// Define the Transaction model
class Transaction extends Model<TransactionAttributes, userTransactionInput> implements TransactionAttributes {
    public transaction_id!: number;
    public user_id!: number;
    public wallet_balance_before!: number;
    public wallet_balance_after!: number;
    public amount!: number;
    public transaction_type!: string; // TypeScript type constraint
    public description?: string;
    public reference_id?: string;
    public transaction_date!: Date;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialize the model
Transaction.init(
    {
        transaction_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: User, // Make sure the table name is correct
                key: 'id'
            }
        },
        wallet_balance_before: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        wallet_balance_after: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        transaction_type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['credit', 'debit']],
            }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reference_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        transaction_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        sequelize,
        tableName: 'userTransactions',
        timestamps: true,
        indexes: [
            {
                unique: false,
                name: 'transactionUserId_index',
                fields: ['user_id']
            }
        ]
    }
);

export default Transaction;
