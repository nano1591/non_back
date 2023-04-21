import { SequelizeClient } from '@/core/db'
import { DataTypes, Model } from 'sequelize'

export class BaseModel extends Model {
  declare id: number
  declare createdAt: Date
  declare updatedAt: Date
}

export const baseOptions = {
  sequelize: SequelizeClient.INSTANCE,
  paranoid: true,
  underscored: true,
  timestamps: true,
  createdAt: true,
  updatedAt: true
}

export const baseFields = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  }
}
