import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../config';
import User from './users';

interface AddressAttributes {
  address_id: number;
  house_number: string;
  apartment?: string;
  landmark?: string;
  type: 'Home' | 'Work' | 'Other';
  user_id: number;
  city?: string;
  state?: string;  
  zipcode?: string;
  country?: string;
  alternative_phone_number?: string; 
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AddressInput extends Optional<AddressAttributes, 'address_id'> {}
export interface AddressOutput extends Required<AddressAttributes> {}

class Address extends Model<AddressAttributes, AddressInput> implements AddressAttributes {
  public address_id!: number;
  public house_number!: string;
  public apartment?: string;
  public landmark?: string;
  public type!: 'Home' | 'Work' | 'Other';
  public user_id!: number;
  public city?: string;
  public state?: string; 
  public zipcode?: string;
  public country?: string;
  public alternative_phone_number?: string; 

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Address.init({
  address_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  house_number: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  apartment: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  landmark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, 
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('Home', 'Work', 'Other'),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(255),
    allowNull: true 
  },
  zipcode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  alternative_phone_number: { 
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  timestamps: true,
  sequelize: sequelizeConnection,
  tableName: 'address',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',


});

export default Address;
