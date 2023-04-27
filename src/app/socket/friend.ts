import {
  deleteFriend,
  getLoginedFriendSocketIdList,
  rejectSkip,
  requestShip,
  sureSkip
} from '../service/friend'
import { getOneUserById, getOneUserByUsername } from '../service/user'
import type { Listener } from '.'

export const changeMyStatusAndnotifyLoginedFriend: Listener = async (io, socket, { status }) => {
  const me = await getOneUserById(socket.data.uid!)
  me.status = status
  await me.save()
  const loginedFriendSocketIdList = await getLoginedFriendSocketIdList(me)
  if (!loginedFriendSocketIdList.length) return
  const sockets = await io.in(loginedFriendSocketIdList).fetchSockets()
  sockets.forEach((_socket) =>
    _socket.emit('friend:notify', { id: me.id, username: me.username, status, icon: me.icon })
  )
}

/** friend:ask */
export const askFriendShip: Listener = async (io, socket, data) => {
  const me = await getOneUserById(socket.data.uid!)
  const friend = await getOneUserByUsername(data.fName)
  await requestShip(me.id, friend.id)
  if (friend.socketId) {
    // 通知对方，发送好友邀请。（发送自己的信息）
    io.in(friend.socketId).emit('friend:ask', { fName: me.username })
  }
}

/** friend:sure */
export const agreeFriendShip: Listener = async (io, socket, data) => {
  const me = await getOneUserById(socket.data.uid!)
  const friend = await getOneUserByUsername(data.fName)
  await sureSkip(me.id, friend.id)
  if (friend.socketId) {
    io.in(friend.socketId).emit('friend:notify', {
      id: me.id,
      username: me.username,
      status: me.status,
      icon: me.icon
    })
  }
}

/** friend:reject */
export const rejectFriendShip: Listener = async (io, socket, data) => {
  const me = await getOneUserById(socket.data.uid!)
  const friend = await getOneUserByUsername(data.fName)
  await rejectSkip(me.id, friend.id)
}

/** friend:delete */
export const deleteFriendShip: Listener = async (io, socket, data) => {
  const me = await getOneUserById(socket.data.uid!)
  const friend = await getOneUserByUsername(data.fName)
  await deleteFriend(me.id, friend.id)
  if (friend.socketId) {
    // 通知对方，我已经删除好友。（发送自己的信息）
    io.in(friend.socketId).emit('friend:delete', { fName: me.username })
  }
}
