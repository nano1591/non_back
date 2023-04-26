import { Op } from "sequelize"
import { FriendShip, IFriendShip, User, UserInfo } from "../model"

/** 用户请求添加某人为好友 */
export const requestShip = async (curUserId: number, friId: number): Promise<FriendShip> => {
  // 当前用户向某人是否发送过请求
  const userShipReq = await FriendShip.findOne({ where: { uid: curUserId, fid: friId } })
  if (userShipReq) {
    switch (userShipReq.status) {
      case "sure": global.PROCESS.forbiddenException(10413)
      case "ask":
      case "reject": userShipReq.status = "ask"
    }
    return await userShipReq.save()
  }
  // 对方是否向用户发送过请求
  const ship = await FriendShip.findOne({ where: { uid: friId, fid: curUserId } })
  if (ship) {
    switch (ship.status) {
      case "sure": global.PROCESS.forbiddenException(10413)
      case "ask": ship.status = "sure"
      case "reject": ship.status = "ask"
    }
    return await ship.save()
  }
  // 创建新请求
  const newShip: IFriendShip = {
    uid: curUserId,
    fid: friId,
    status: "ask"
  }
  return await FriendShip.create(newShip)
}

export const rejectSkip = async (curUserId: number, friId: number): Promise<unknown> => {
  // 对方是否向用户发送过请求
  const ship = await FriendShip.findOne({ where: { uid: friId, fid: curUserId } })
  if (!ship) return global.PROCESS.forbiddenException(10415)
  switch (ship.status) {
    case "sure": global.PROCESS.forbiddenException(10413)
    case "ask":
    case "reject": ship.status = "reject"
  }
  return await ship.save()
}

export const sureSkip = async (curUserId: number, friId: number): Promise<unknown> => {
  // 对方是否向用户发送过请求
  const ship = await FriendShip.findOne({ where: { uid: friId, fid: curUserId } })
  if (!ship) return global.PROCESS.forbiddenException(10415)
  switch (ship.status) {
    case "sure": global.PROCESS.forbiddenException(10413)
    case "ask":
    case "reject": ship.status = "sure"
  }
  return await ship.save()
}

type SkipItem = Pick<User, 'username'> & Pick<FriendShip, 'createdAt' | 'updatedAt'>

/** 用户收到的和发出的好友申请信息 */
export const getSkipList = async (user: User): Promise<SkipItem[]> => {
  const mapSkipList = (list: User[]): SkipItem[] => list.map(user => ({
    username: user.username,
    createdAt: user.FriendShip!.createdAt,
    updatedAt: user.FriendShip!.updatedAt
  }))
  const compareFn = (a: SkipItem, b: SkipItem): number => new Date(a.updatedAt) < new Date(b.updatedAt) ? 1 : -1
  return mapSkipList((await user.getSkipToMe()).filter(user => user.FriendShip!.status === "sure")).sort(compareFn)
}

export const getFriendList = async (user: User): Promise<UserInfo[]> => {
  const mapFriendList = (list: User[]): UserInfo[] => list.map(user => ({
    id: user.id,
    username: user.username,
    status: user.status
  }))
  const friendList = [
    mapFriendList((await user.getSkipToMe()).filter(user => user.FriendShip!.status === "sure")),
    mapFriendList((await user.getSkipSend()).filter(user => user.FriendShip!.status === "sure"))
  ].flat()
  const compareFn = (a: UserInfo, b: UserInfo): number => {
    if (a.status !== "outline" && b.status !== "outline") return a.username.toUpperCase() < b.username.toUpperCase() ? -1 : 1
    else if (a.status !== "outline") return -1
    else return 1
  }
  return friendList.sort(compareFn)
}

export const getLoginedFriendSocketIdList = async (user: User): Promise<string[]> => {
  const mapFriendList = (list: User[]): string[] => list.map(user => user.socketId!)
  const friendList = [
    mapFriendList((await user.getSkipToMe()).filter(user => user.FriendShip!.status === "sure" && user.socketId)),
    mapFriendList((await user.getSkipSend()).filter(user => user.FriendShip!.status === "sure" && user.socketId))
  ].flat()
  return friendList.sort()
}

export const deleteFriend = async (curUserId: number, friId: number): Promise<unknown> => {
  const skip = await FriendShip.findOne({
    where: {
      [Op.or]: [
        { uid: curUserId, fid: friId },
        { uid: friId, fid: curUserId }
      ],
      [Op.and]: { status: 'sure' }
    }
  })
  if (!skip) return global.PROCESS.forbiddenException(10417)
  return await skip.destroy()
}