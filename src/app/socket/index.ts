import { Server } from 'socket.io'
import type { Socket as SocketIo } from 'socket.io'
import type { Server as HttpServer } from 'http'
import loginMiddlewate from './login-middlewate'
import {
  agreeFriendShip,
  askFriendShip,
  deleteFriendShip,
  changeMyStatusAndnotifyLoginedFriend,
  rejectFriendShip
} from './friend'
import Logger from '@/core/log'
import {
  agreeGameRoom,
  askGameRoom,
  changeItem,
  createGameRoom,
  dissolveGameRoom,
  joinGameRoom,
  kickoutGameRoom,
  quitGameRoom,
  reMaster,
  reName,
  rejectGameRoom
} from './room'
import { ItemId, RoomInfo, UserInRoom, UserInfo } from '../model'
import { changeMyIcon } from './user'

// 【消息接收对象|领域】:消息类型

export type ServerToClientEvents = {
  /** 好友状态变更状态，没有则新建 */
  'friend:notify': (data: UserInfo) => void
  /** 对方发送给自己的好友申请 */
  'friend:ask': (data: { fName: string }) => void
  /** 对方删除自己 */
  'friend:delete': (data: { fName: string }) => void

  /** 别人发送给自己的房间邀请 */
  'me:room:ask': (data: { info: RoomInfo; fName: string }) => void
  /** 加入房间失败 */
  'me:room:failed': (data: { info: RoomInfo }) => void
  /** 自己退出了房间 */
  'me:room:quit': (data: { info: RoomInfo }) => void
  /** 自己被踢出房间 */
  'me:room:kickout': (data: { info: RoomInfo }) => void
  /** 房间被解散 */
  'me:room:dissolve': (data: { info: RoomInfo }) => void

  /** 正在邀请别人加入房间 */
  'room:ask': (data: { info: RoomInfo; fName: string }) => void
  /** 别人拒绝加入房间 */
  'room:reject': (data: { info: RoomInfo; fName: string }) => void
  /** 某人加入房间失败 */
  'room:failed': (data: { info: RoomInfo; fName: string }) => void
  /** 某人退出了房间 */
  'room:quit': (data: { info: RoomInfo; fName: string }) => void
  /** 某人被踢出房间 */
  'room:kickout': (data: { info: RoomInfo; fName: string }) => void
  /** 某人加入了房间 */
  'room:join': (data: { info: RoomInfo; fName: string }) => void
  /** 房间的新况 */
  'room:list': (data: { info: RoomInfo; list: UserInRoom[] }) => void
}

export interface ClientToServerEvents {
  /** 更换图标 */
  'me:icon': (data: { icon: number }) => void
  /** 给别人发送好友申请 */
  'friend:ask': (data: { fName: string }) => void
  /** 同意别人的好友申请 */
  'friend:sure': (data: { fName: string }) => void
  /** 拒绝别人的好友申请 */
  'friend:reject': (data: { fName: string }) => void
  /** 删除好友 */
  'friend:delete': (data: { fName: string }) => void

  /** 创建房间 */
  'room:create': (data: { rName: string }) => void
  /** 更改房间名 */
  'room:rename': (data: { rid: number; rName: string }) => void
  /** 更改房主 */
  'room:master': (data: { rid: number; masterId: number }) => void
  /** 邀请别人加入我的房间*/
  'room:ask': (data: { rid: number; fName: string }) => void
  /** 加入别人的房间 */
  'room:sure': (data: { rid: number }) => void
  /** 拒绝加入别人的房间 */
  'room:reject': (data: { rid: number }) => void
  /** 加入别人的房间 */
  'room:join': (data: { fName: string }) => void
  /** 把某人踢出自己的房间 */
  'room:kickout': (data: { rid: number; fName: string }) => void
  /** 退出房间 */
  'room:quit': () => void
  /** 解散自己的房间 */
  'room:dissolve': (data: { rid: number }) => void
  /** 更换队伍 */
  'room:item': (data: { rid: number; itemId: ItemId }) => void
}

export interface SocketData {
  uid: number
}

export type IO = Server<ClientToServerEvents, ServerToClientEvents, any, SocketData>
export type Socket = SocketIo<ClientToServerEvents, ServerToClientEvents, any, SocketData>
export type Listener = (io: IO, socket: Socket, data: any) => Promise<void>

const wrap = async (fun: () => Promise<void>) => {
  try {
    await fun()
  } catch (e) {
    Logger.error('socket.io', e)
  }
}
const listenerWrap = (io: IO, socket: Socket) => (fun: Listener) => async (data?: any) => {
  await wrap(async () => fun(io, socket, typeof data === 'string' ? JSON.parse(data) : data))
}

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, any, SocketData>(httpServer, {
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true
    },
    cors: {
      origin: '*'
    }
  })

  io.use(loginMiddlewate)

  io.on('connection', async (socket) => {
    const listener = listenerWrap(io, socket)
    listener(changeMyStatusAndnotifyLoginedFriend)({ status: 'online' })
    socket.on('disconnect', () =>
      listener(changeMyStatusAndnotifyLoginedFriend)({ status: 'outline' })
    )
    socket.on('me:icon', listener(changeMyIcon))

    socket.on('friend:ask', listener(askFriendShip))
    socket.on('friend:sure', listener(agreeFriendShip))
    socket.on('friend:reject', listener(rejectFriendShip))
    socket.on('friend:delete', listener(deleteFriendShip))

    socket.on('room:create', listener(createGameRoom))
    socket.on('room:rename', listener(reName))
    socket.on('room:master', listener(reMaster))
    socket.on('room:ask', listener(askGameRoom))
    socket.on('room:sure', listener(agreeGameRoom))
    socket.on('room:reject', listener(rejectGameRoom))
    socket.on('room:join', listener(joinGameRoom))
    socket.on('room:kickout', listener(kickoutGameRoom))
    socket.on('room:quit', listener(quitGameRoom))
    socket.on('room:dissolve', listener(dissolveGameRoom))
    socket.on('room:item', listener(changeItem))
  })
}
