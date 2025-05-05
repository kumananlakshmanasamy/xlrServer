import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeConnection from '../config'; 

// Define the attributes for the Image model
interface ImageAttributes {
  image_id: number;
  image_url: string;
  alt_text?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the creation attributes for the Image model, making 'image_id' optional
export interface ImageInput extends Optional<ImageAttributes, 'image_id'> {}
export interface ImageOuput extends Required<ImageAttributes> {}
// Define the Image class
class Image extends Model<ImageAttributes, ImageInput> implements ImageAttributes {
  public image_id!: number;
  public image_url!: string;
  public alt_text?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  url: any;
}

// Initialize the Image model
Image.init({
  image_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },

  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  alt_text: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize: sequelizeConnection,
  tableName: 'images',
  timestamps: true,
  indexes: [
    {
        unique: true,
        name: 'imageId_index',
        fields: ['image_id']
    }
]
});

export default Image;
