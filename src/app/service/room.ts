import { User, Room, IRoom, RoomItem, IRoomItem, UserInRoom } from '../model'

export const createAndJoinRoom = async (uid: number, rName: string): Promise<Room> => {
  const me = await User.findByPk(uid, { include: [RoomItem, Room] })
  if (!me) throw Error()
  if (me.Room) {
    if (me.Room.masterId === me.id) await me.Room.destroy()
    else await me.Room.removeUser(me)
  }
  await me.RoomItem?.destroy()
  const newRoom: IRoom = {
    masterId: uid,
    name: rName
  }
  await me.createRoom(newRoom)
  const newRoomItem: IRoomItem = { itemId: 0 }
  await me.createRoomItem(newRoomItem)
  return (await Room.findOne({ where: { masterId: uid } }))!
}

export const leaveRoom = async (uid: number): Promise<Room | null> => {
  const me = await User.findByPk(uid, { include: [RoomItem, Room] })
  if (!me) throw Error()
  await me.Room?.removeUser(me)
  await me.RoomItem?.destroy()
  return me.Room
}

export const dissolveRoom = async (uid: number): Promise<void> => {
  const me = await User.findByPk(uid, { include: [RoomItem, Room] })
  if (!me) throw Error()
  if (me.Room?.masterId === me.id) await me.Room.destroy()
  await me.RoomItem?.destroy()
}

export const getRoomUsersByMasterId = async (masterId: number): Promise<UserInRoom[]> => {
  const room = await Room.findOne({ where: { masterId } })
  if (!room) return []
  const roomUsers = await room.getUsers({ include: RoomItem })
  return roomUsers.map((user) => ({
    id: user.id,
    username: user.username,
    icon: user.icon,
    itemId: user.RoomItem!.itemId,
    index: user.RoomItem!.index
  }))
}

export const getRoomUsersByPK = async (id: number): Promise<UserInRoom[]> => {
  const room = await Room.findByPk(id)
  if (!room) return []
  const roomUsers = await room.getUsers({ include: RoomItem })
  return roomUsers.map((user) => ({
    id: user.id,
    username: user.username,
    icon: user.icon,
    itemId: user.RoomItem!.itemId,
    index: user.RoomItem!.index
  }))
}
