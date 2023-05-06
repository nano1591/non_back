import CONFIG from '@/config'
import { IO, Listener, Socket } from '.'
import { getOneUserById, getOneUserByUsername } from '../service/user'
import { Room, RoomInfo, RoomItem, User } from '../model'
import {
  createAndJoinRoom,
  getRoomUsersByMasterId,
  getRoomUsersByPK,
} from '../service/room'
import {
  changeMyStatusAndnotifyLoginedFriend,
  changeUserStatusAndNotifyLoginedFriend
} from './friend'

/** 加入房间失败 */
const notifyJoinFailed = (io: IO, socket: Socket, roomInfo: RoomInfo, fName: string) => {
  io.in(roomInfo.name).emit('room:failed', { info: roomInfo, fName })
  socket.emit('me:room:failed', { info: roomInfo })
}

/**
 * room:create
 * 创建房间并加入
 * 1.清空房间
 * 2.加入房间，并在第0位
 * 3.把状态持久化
 * 4.通知在线好友自己的房间状态
 */
export const createGameRoom: Listener = async (io, socket, data) => {
  const me = await getOneUserById(socket.data.uid!)

  io.socketsLeave(data.rName)
  io.in(socket.id).socketsJoin(data.rName)

  const room = await createAndJoinRoom(me.id, data.rName)
  const list = await getRoomUsersByMasterId(me.id)
  io.in(room.name).emit('room:list', {
    info: { id: room.id, masterId: room.masterId, name: room.name },
    list
  })
  await changeMyStatusAndnotifyLoginedFriend(io, socket, { status: 'room' })
}

/**
 * room:ask
 * 邀请别人加入房间
 * 1.目标用户要在线
 * 2.用户已经在房间内，则给房间内的人发送用户同意邀请通知
 * 3.给目标用户发送邀请通知
 * 4.给房间内的人发送邀请用户通知
 */
export const askGameRoom: Listener = async (io, socket, data) => {
  const me = await getOneUserById(socket.data.uid!)
  const user = await getOneUserByUsername(data.fName)
  if (!user.socketId) return
  const room = await Room.findByPk(data.rid)
  if (!room) return
  const roomUser = await getRoomUsersByPK(room.id)
  if (roomUser.find((user) => user.username === data.fName)) return

  const info = { id: room.id, masterId: room.masterId, name: room.name }
  io.in(room.name).emit('room:ask', { info, fName: data.fName })
  io.in(user.socketId).emit('me:room:ask', { info, fName: me.username })
}

export const quitOrDissolveOldRoom = async (io: IO, socket: Socket, status = "online") => {
  const me = await User.findByPk(socket.data.uid!, { include: [RoomItem, Room] })
  if (!me) throw Error()
  const room = me.Room
  if (!room) return
  const info = { id: room.id, masterId: room.masterId, name: room.name }
  if (room?.masterId === me.id) {
    await dissolveGameRoom(io, socket, { rid: room.id, status })
  } else {
    io.in(socket.id).socketsLeave(room.name)
    const list = await getRoomUsersByMasterId(room.masterId)
    io.in(room.name).emit('room:list', { info, list })
    socket.emit('me:room:quit', { info })
    room.removeUser(me)
    me.RoomItem?.destroy()
    changeUserStatusAndNotifyLoginedFriend(io, me, { status })
  }
}

export const quitGameRoom: Listener = async (io, socket) => {
  await quitOrDissolveOldRoom(io, socket)
}

const joinRoom = async (io: IO, socket: Socket, room: Room, me: User) => {
  const users = await getRoomUsersByPK(room.id)
  if (!users.length || users.length === 2 * CONFIG.ROOM.MAX_ITEM_SIZE) {
    notifyJoinFailed(io, socket, room, me.username)
    return
  }
  const item0 = users.filter((room) => room.itemId === 0)
  const item1 = users.filter((room) => room.itemId === 1)
  const itemId = item0.length <= item1.length ? 0 : 1
  await me.createRoomItem({ itemId })
  await me.setRoom(room)

  io.in(socket.id).socketsJoin(room.name)
  const list = await getRoomUsersByPK(room.id)
  io.in(room.name).emit('room:join', {
    info: { id: room.id, masterId: room.masterId, name: room.name },
    fName: me.username
  })
  io.in(room.name).emit('room:list', {
    info: { id: room.id, masterId: room.masterId, name: room.name },
    list
  })
  await changeMyStatusAndnotifyLoginedFriend(io, socket, { status: 'room' })
}

/**
 * room:sure
 * 我同意别人的房间邀请
 * 1.我已经在房间，则退出房间
 * 2.房间不存在，加入失败
 * 3.计算房间的空位， 满员则加入失败
 * 4.将自己的房间状态持久化
 * 5.通知自己加入房间成功，并发送房间玩家信息
 * 6.通知房间内的人 自己加入成功
 * 7.通知在线好友自己的房间状态
 */
export const agreeGameRoom: Listener = async (io, socket, data) => {
  await quitOrDissolveOldRoom(io, socket)
  const me = await getOneUserById(socket.data.uid!)
  const room = await Room.findByPk(data.rid)
  if (!room) return
  await joinRoom(io, socket, room, me)
}

/**
 * room:join
 * 直接加入别人的房间
 * 1.我已经在房间，则退出房间
 * 2.房间不存在，加入失败
 * 3.计算房间的空位， 满员则发送失败通知
 * 4.将自己的房间状态持久化
 * 5.通知自己加入房间成功，并发送房间玩家信息
 * 6.通知房间内的人 自己加入成功
 * 7.通知在线好友自己的房间状态
 */
export const joinGameRoom: Listener = async (io, socket, data) => {
  await quitOrDissolveOldRoom(io, socket)
  const me = await getOneUserById(socket.data.uid!)
  const friend = await User.findOne({ where: { username: data.fName }, include: Room })
  const room = friend?.Room
  if (!room) return
  await joinRoom(io, socket, room, me)
}

/**
 * room:reject
 * 自己拒绝加入别人的房间
 * 1.通知房间内的人 自己拒绝加入
 */
export const rejectGameRoom: Listener = async (io, socket, data) => {
  const me = await getOneUserById(socket.data.uid!)
  const room = await Room.findByPk(data.rid)
  if (!room) return
  const info = { id: room.id, masterId: room.masterId, name: room.name }
  io.in(room.name).emit('room:reject', { info, fName: me.username })
}

/**
 * room:kickout
 * 把某人踢出房间
 */
export const kickoutGameRoom: Listener = async (io, socket, data) => {
  const room = await Room.findByPk(data.rid)
  if (!room) return
  const roomUsers = await room.getUsers({ include: RoomItem })
  const user = roomUsers.find((user) => user.username === data.fName)
  if (!user || !user.socketId) return
  await user.RoomItem?.destroy()
  await room.removeUser(user)

  io.in(user.socketId).socketsLeave(room.name)
  const info = { id: room.id, masterId: room.masterId, name: room.name }
  const list = await getRoomUsersByPK(room.id)
  io.in(room.name).emit('room:kickout', { info, fName: data.fName })
  io.in(room.name).emit('room:list', { info, list })
  io.in(user.socketId).emit('me:room:kickout', { info })
  await changeUserStatusAndNotifyLoginedFriend(io, user, { status: 'online' })
}

/**
 * room:item
 * 更换队伍
 */
export const changeItem: Listener = async (io, socket, data) => {
  const me = await User.findByPk(socket.data.uid!, { include: [Room, RoomItem] })
  if (!me || !me.Room || !me.RoomItem) return
  if (![0, 1].includes(data.itemId)) return
  const room = me.Room
  const users = await getRoomUsersByPK(room.id)
  const item = users.filter((room) => room.itemId === data.itemId)
  if (item.length >= CONFIG.ROOM.MAX_ITEM_SIZE) return

  await me.RoomItem.destroy()
  await me.createRoomItem({ itemId: data.itemId })

  const list = await getRoomUsersByPK(room.id)
  io.in(room.name).emit('room:list', {
    info: { id: room.id, masterId: room.masterId, name: room.name },
    list
  })
}

/**
 * room:dissolve
 * 房主解散房间
 */
export const dissolveGameRoom: Listener = async (io, socket, data) => {
  const room = await Room.findByPk(data.rid)
  if (!room) return
  if (room.masterId !== socket.data.uid) return
  const info = { id: room.id, masterId: room.masterId, name: room.name }
  io.in(room.name).emit('me:room:dissolve', { info })
  const roomUsers = await room.getUsers({ include: RoomItem })
  roomUsers.forEach(async (user) => {
    changeUserStatusAndNotifyLoginedFriend(io, user, { status: data.status ?? 'online' })
    await user.RoomItem?.destroy()
  })
  await room.destroy()
}

/**
 * room:rename
 * 更换房间名称
 */
export const reName: Listener = async (io, socket, data) => {
  const room = await Room.findByPk(data.rid)
  if (!room) return
  if (room.masterId !== socket.data.uid) return
  const oldName = room.name
  room.name = data.rName
  await room.save()

  const newRoom = await Room.findByPk(data.rid)
  if (!newRoom) return
  io.in(oldName).socketsJoin(newRoom.name)
  const info = { id: newRoom.id, masterId: newRoom.masterId, name: newRoom.name }
  const list = await getRoomUsersByPK(newRoom.id)
  io.in(newRoom.name).emit('room:list', { info, list })
}

/**
 * room:master
 * 更换房主
 */
export const reMaster: Listener = async (io, socket, data) => {
  const room = await Room.findByPk(data.rid)
  if (!room) return
  if (room.masterId !== socket.data.uid) return
  const users = await getRoomUsersByPK(room.id)
  if (!users.map((user) => user.id).includes(data.masterId)) return
  room.masterId = data.masterId
  await room.save()

  const newRoom = await Room.findByPk(data.rid)
  if (!newRoom) return
  const info = { id: newRoom.id, masterId: newRoom.masterId, name: newRoom.name }
  const list = await getRoomUsersByPK(newRoom.id)
  io.in(newRoom.name).emit('room:list', { info, list })
}
