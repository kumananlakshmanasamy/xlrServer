import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config';

interface PassengerAttributes {
  id: number;
  hyderabad_name: string;
  hyderabad_mobile: string;
  hyderabad_email: string;
  hyderabad_pickup_location: string;
  dubai_number: string;
  dubai_pickup_location: string;
  date_of_travel: Date;
  visa_document: string;
  ticket_document: string;
  luggage_space: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PassengerInput extends Optional<PassengerAttributes, 'id'> {}
export interface PassengerOutput extends Required<PassengerAttributes> {}

class Passenger extends Model<PassengerAttributes, PassengerInput> implements PassengerAttributes {
  public id!: number;
  public hyderabad_name!: string;
  public hyderabad_mobile!: string;
  public hyderabad_email!: string;
  public hyderabad_pickup_location!: string;
  public dubai_number!: string;
  public dubai_pickup_location!: string;
  public date_of_travel!: Date;
  public visa_document!: string;
  public ticket_document!: string;
  public luggage_space!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Passenger.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    hyderabad_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hyderabad_mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hyderabad_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hyderabad_pickup_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dubai_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dubai_pickup_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_travel: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    visa_document: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ticket_document: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    luggage_space: {
      type: DataTypes.FLOAT,
       allowNull: true,   
    },
  },
  {
    sequelize,
    tableName: 'Passenger_tbl',
    timestamps: true,
  }
);

export default Passenger;
