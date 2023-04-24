import { Server } from "socket.io"
import type { Socket as SocketIo } from 'socket.io'
import type { Server as HttpServer } from 'http'
import loginMiddlewate from "./login-middlewate"
import { agreeFriendShip, askFriendShip, deleteFriendShip, notifyLoginedFriendsMeLogin, notifyLoginedFriendsMeLogout, rejectFriendShip } from "./friend"
import Logger from "@/core/log"
import { FriendInfo } from "../service/friend"

export type ServerToClientEvents = {
  /** test用 */
  "socket:id": (data: { socketId: string }) => void
  /** 通知好友，自己上线了 */
  "friend:login": (data: FriendInfo) => void
  /** 通知好友，自己下线了 */
  "friend:logout": (data: { fName: string }) => void
  /** 对方发送给自己的好友申请 */
  "friend:ask": (data: { fName: string }) => void
  /** 对方同意自己的好友申请 */
  "friend:sure": (data: FriendInfo) => void
  // /** 对方拒绝自己的好友申请 */
  // "friend:reject": (data: { fName: string }) => void
  /** 对方删除自己 */
  "friend:delete": (data: { fName: string }) => void
}

export interface ClientToServerEvents {
  /** 给别人发送好友申请 */
  "friend:ask": (data: { fName: string }) => void
  /** 同意别人的好友申请 */
  "friend:sure": (data: { fName: string }) => void
  /** 拒绝别人的好友申请 */
  "friend:reject": (data: { fName: string }) => void
  /** 删除好友 */
  "friend:delete": (data: { fName: string }) => void
}

export interface SocketData {
  uid: number
}

export type IO = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
export type Socket = SocketIo<ClientToServerEvents, ServerToClientEvents, {}, SocketData>

const wrap = async (fun: Function) => { try { await fun() } catch (e) { Logger.error("socket.io", e) } }
const listenerWrap = (io: IO, socket: Socket) => (fun: (io: IO, socket: Socket, data: any) => void) => async (data: any) => {
  await wrap(async () => fun(io, socket, JSON.parse(data)))
}

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(httpServer, {
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    }
  })

  io.use(loginMiddlewate)

  io.on("connection", async (socket) => {
    socket.emit('socket:id', { socketId: socket.id })
    wrap(async () => await notifyLoginedFriendsMeLogin(io, socket))
    socket.on("disconnect", async () => wrap(async () => await notifyLoginedFriendsMeLogout(io, socket)))
    const listener = listenerWrap(io, socket)
    socket.on("friend:ask", listener(askFriendShip))
    socket.on("friend:sure", listener(agreeFriendShip))
    socket.on("friend:reject", listener(rejectFriendShip))
    socket.on("friend:delete", listener(deleteFriendShip))
  })
}
