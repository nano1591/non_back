import { DataTypes, FindOptions } from 'sequelize'
import { User } from './user'
import { BaseModel, baseOptions } from './base'

export type IRoom = Pick<Room, 'masterId' | 'name'>
export type RoomInfo = Pick<Room, 'id' | 'masterId' | 'name'>

export class Room extends BaseModel {
  declare masterId: number
  declare name: string

  declare getUsers: (options?: FindOptions<any>) => Promise<User[]>
  declare removeUser: (user: User) => Promise<unknown>
  declare addUser: (user: User) => Promise<unknown>
}

Room.init(
  {
    masterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    }
  },
  {
    ...baseOptions,
    tableName: 'room',
    paranoid: false
  }
)
// 一个房间有多个用户
Room.hasMany(User)
User.belongsTo(Room)
