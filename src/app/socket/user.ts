import { Listener } from '.'
import { Room, User } from '../model'
import { getLoginedFriendSocketIdList } from '../service/friend'
import { getRoomUsersByPK } from '../service/room'

export const changeMyIcon: Listener = async (io, socket, { icon }) => {
  const me = await User.findByPk(socket.data.uid!, { include: [Room] })
  if (!me) return
  if (!Number.isFinite(icon)) return
  me.icon = icon
  await me.save()
  const loginedFriendSocketIdList = await getLoginedFriendSocketIdList(me)
  if (!loginedFriendSocketIdList.length) return
  const sockets = await io.in(loginedFriendSocketIdList).fetchSockets()
  sockets.forEach((_socket) =>
    _socket.emit('friend:notify', { id: me.id, username: me.username, status: me.status, icon })
  )
  const room = me.Room
  if (!room) return
  const list = await getRoomUsersByPK(room.id)
  io.in(room.name).emit('room:list', {
    info: { id: room.id, masterId: room.masterId, name: room.name },
    list
  })
}
