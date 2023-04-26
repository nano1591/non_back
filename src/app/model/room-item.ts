import { DataTypes, FindOptions } from 'sequelize'
import { User, UserInfo } from './user'
import { BaseModel, baseOptions } from './base'

/**
 * 队伍ID
 * 0 -》 左边
 * 1 -》 右边
 */
export type ItemId = 0 | 1

export type IRoomItem = Pick<RoomItem, 'itemId'>
export type UserInRoom = Omit<UserInfo, 'status'> & Pick<RoomItem, 'index' | 'itemId'>

export class RoomItem extends BaseModel {
  declare itemId: ItemId
  declare index: number

  declare getUser: (options?: FindOptions<any>) => Promise<User>
  declare User: User | null
}

RoomItem.init(
  {
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    index: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
  },
  {
    ...baseOptions,
    tableName: 'room-item',
    paranoid: false
  }
)
// 一个用户只能有一个位置
User.hasOne(RoomItem)
RoomItem.belongsTo(User)
