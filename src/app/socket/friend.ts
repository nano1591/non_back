import { deleteFriend, getLoginedFriendSocketIdList, rejectSkip, requestShip, sureSkip } from "../service/friend"
import { getOneUserById, getOneUserByUsername } from "../service/user"
import type { IO, Socket } from "."

/** friend:login */
export const notifyLoginedFriendsMeLogin = async (io: IO, socket: Socket) => {
  const me = await getOneUserById(socket.data.uid!)
  const loginedFriendSocketIdList = await getLoginedFriendSocketIdList(me)
  if (!loginedFriendSocketIdList.length) return
  const sockets = await io.in(loginedFriendSocketIdList).fetchSockets()
  // 通知好友，我已上线。（传自己的信息）
  sockets.forEach(_socket => _socket.emit("friend:login", { username: me.username, socketId: socket.id }))
}

/** friend:logout */
export const notifyLoginedFriendsMeLogout = async (io: IO, socket: Socket) => {
  const me = await getOneUserById(socket.data.uid!)
  const loginedFriendSocketIdList = await getLoginedFriendSocketIdList(me)
  if (!loginedFriendSocketIdList.length) return
  const sockets = await io.in(loginedFriendSocketIdList).fetchSockets()
  // 通知好友，我已上线。（传自己的信息）
  sockets.forEach(_socket => _socket.emit("friend:logout", { fName: me.username }))
}

/** friend:ask */
export const askFriendShip = async (io: IO, socket: Socket, data: any) => {
  const me = await getOneUserById(socket.data.uid!)
  const friend = await getOneUserByUsername(data.fName)
  await requestShip(me.id, friend.id)
  if (friend.socketId) {
    // 通知对方，发送好友邀请。（发送自己的信息）
    io.in(friend.socketId).emit("friend:ask", { fName: me.username })
  }
}

/** friend:sure */
export const agreeFriendShip = async (io: IO, socket: Socket, data: any) => {
  const me = await getOneUserById(socket.data.uid!)
  const friend = await getOneUserByUsername(data.fName)
  await sureSkip(me.id, friend.id)
  if (friend.socketId) {
    // 通知对方，我已经同意好友申请。（发送自己的信息）
    io.in(friend.socketId).emit("friend:sure", { username: me.username, socketId: me.socketId })
  }
}

/** friend:reject */
export const rejectFriendShip = async (io: IO, socket: Socket, data: any) => {
  const me = await getOneUserById(socket.data.uid!)
  const friend = await getOneUserByUsername(data.fName)
  await rejectSkip(me.id, friend.id)
  // if (friend.socketId) {
  //   // 通知对方，我拒绝了好友申请。（传自己的信息）
  //   io.in(friend.socketId).emit("friend:reject", { fName: me.username })
  // }
}

/** friend:delete */
export const deleteFriendShip = async (io: IO, socket: Socket, data: any) => {
  const me = await getOneUserById(socket.data.uid!)
  const friend = await getOneUserByUsername(data.fName)
  await deleteFriend(me.id, friend.id)
  if (friend.socketId) {
    // 通知对方，我已经删除好友。（发送自己的信息）
    io.in(friend.socketId).emit("friend:delete", { fName: me.username })
  }
}