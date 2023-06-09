import { DataTypes } from 'sequelize'
import { User } from './user'
import { BaseModel, baseOptions } from './base'

/**
 * 添加好友的状态
 *  1.ask： 询问中
 *  2.reject： 拒绝
 *  3.sure：同意
 */
export type FriendShipStatus = 'ask' | 'reject' | 'sure'

export class FriendShip extends BaseModel {
  declare uid: number
  declare fid: number

  declare status: FriendShipStatus
}

export type IFriendShip = Pick<FriendShip, 'uid' | 'fid' | 'status'>

FriendShip.init(
  {
    status: DataTypes.TEXT
  },
  {
    ...baseOptions,
    tableName: 'friend-ship',
    paranoid: false
  }
)

User.belongsToMany(User, { as: 'skipSend', through: FriendShip, foreignKey: 'uid' })
User.belongsToMany(User, { as: 'skipToMe', through: FriendShip, foreignKey: 'fid' })
