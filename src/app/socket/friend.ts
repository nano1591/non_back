import {
  deleteFriend,
  getLoginedFriendSocketIdList,
  rejectSkip,
  requestShip,
  sureSkip
} from '../service/friend'
import { getOneUserById, getOneUserByUsername } from '../service/user'
import type { IO, Listener } from '.'
import { quitOrDissolveOldRoom } from './room'
import { User } from '../model'

export const changeMyStatusAndnotifyLoginedFriend: Listener = async (io, socket, { status }) => {
  const me = await getOneUserById(socket.data.uid!)
  me.socketId = socket.id
  if (status === 'outline') {
    me.socketId = null
    return quitOrDissolveOldRoom(io, socket, 'outline')
  }
  changeUserStatusAndNotifyLoginedFriend(io, me, { status })
}

export const changeUserStatusAndNotifyLoginedFriend = async (
  io: IO,
  user: User,
  { status }: any
) => {
  user.status = status
  await user.save()
  const loginedFriendSocketIdList = await getLoginedFriendSocketIdList(user)
  if (!loginedFriendSocketIdList.length) return
  const sockets = await io.in(loginedFriendSocketIdList).fetchSockets()
  sockets.forEach((_socket) =>
    _socket.emit('friend:notify', { id: user.id, username: user.username, status, icon: user.icon })
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
  socket.emit('friend:notify', {
    id: friend.id,
    username: friend.username,
    status: friend.status,
    icon: friend.icon
  })
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
