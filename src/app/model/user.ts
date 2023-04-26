import { DataTypes } from 'sequelize'
import { BaseModel, baseFields, baseOptions } from './base'
import { FriendShip, IRoom, Room } from '.'
import { IRoomItem, RoomItem } from './room-item'

export type UserStatus = "online" | "outline" | "room" | "gaming"

export class User extends BaseModel {
  declare account: string
  declare username: string
  declare password: string
  declare status: UserStatus
  declare socketId: string | null

  /** 用户收到的好友申请 */
  declare getSkipToMe: () => Promise<User[]>
  /** 用户发出的好友申请 */
  declare getSkipSend: () => Promise<User[]>
  /** 相关联的好友请求列表 */
  declare FriendShip: FriendShip | null

  /** 用户的房间信息 */
  declare getRoom: () => Promise<Room>
  declare setRoom: (room: Room) => Promise<unknown>
  declare createRoom: (room: IRoom) => Promise<unknown>
  /** 用户的房间信息 */
  declare Room: Room | null

  /** 用户在房间中的位置信息 */
  declare getRoomItem: () => Promise<RoomItem>
  declare createRoomItem: (roomItem: IRoomItem) => Promise<unknown>
  declare RoomItem: RoomItem | null
}

export type IUser = Pick<User, "account" | "username" | "password">
export type UserInfo = Pick<User, 'id' | 'username' | 'status'>

User.init(
  {
    ...baseFields,
    account: {
      type: DataTypes.TEXT,
      unique: true
    },
    username: {
      type: DataTypes.TEXT,
      unique: true
    },
    password: {
      type: DataTypes.TEXT
    },
    socketId: DataTypes.TEXT,
    status: {
      type: DataTypes.TEXT,
      defaultValue: "outline",
      allowNull: false
    }
  },
  {
    tableName: 'users',
    ...baseOptions,
  }
)