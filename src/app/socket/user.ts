import { Listener } from '.'
import { getLoginedFriendSocketIdList } from '../service/friend'
import { getOneUserById } from '../service/user'

export const changeMyIcon: Listener = async (io, socket, { icon }) => {
  const me = await getOneUserById(socket.data.uid!)
  if (!Number.isFinite(icon)) return
  me.icon = icon
  await me.save()
  const loginedFriendSocketIdList = await getLoginedFriendSocketIdList(me)
  if (!loginedFriendSocketIdList.length) return
  const sockets = await io.in(loginedFriendSocketIdList).fetchSockets()
  sockets.forEach((_socket) =>
    _socket.emit('friend:notify', { id: me.id, username: me.username, status: me.status, icon })
  )
}
