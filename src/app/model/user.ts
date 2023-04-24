import { DataTypes } from 'sequelize'
import { BaseModel, baseFields, baseOptions } from './base'
import { FriendShip } from '.'

export class User extends BaseModel {
  declare account: string
  declare username: string
  declare password: string
  declare socketId: string
  /** 用户收到的好友申请 */
  declare getSkipToMe: () => Promise<User[]>
  /** 用户发出的好友申请 */
  declare getSkipSend: () => Promise<User[]>
  /** 相关联的好友请求列表 */
  declare FriendShip: FriendShip
}

export type IUser = Pick<User, "account" | "username" | "password">

User.init(
  {
    ...baseFields,
    account: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    socketId: DataTypes.TEXT
  },
  {
    tableName: 'users',
    ...baseOptions,
  }
)
