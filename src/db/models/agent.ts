import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface AgentAttributes {
  id: number;
  user_id: number; // Just a reference, no foreign key
  company_name: string;
  company_number: string;
  company_address: string;
  commission_earned: number;
  total_referrals_done: number;
  createdAt?: Date;
  updatedAt?: Date;
  user_name:string;
}

export interface AgentInput extends Optional<AgentAttributes, 'id'> {}
export interface AgentOutput extends Required<AgentAttributes> {}

class Agent extends Model<AgentAttributes, AgentInput> implements AgentAttributes {
  public id!: number;
  public user_id!: number;
  public company_name!: string;
  public company_number!: string;
  public company_address!: string;
  public commission_earned!: number;
  public total_referrals_done!: number;
  public user_name :string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Agent.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_name:{
    type: DataTypes.STRING(100),
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
    // No references or foreign key defined
  },
  company_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  company_number: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  company_address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  commission_earned: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  total_referrals_done: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize: sequelizeConnection,
  timestamps: true,
  tableName: 'Agent_tbl'
});

export default Agent;
