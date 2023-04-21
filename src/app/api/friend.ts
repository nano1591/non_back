import type { Context } from "koa"
import Joi from 'joi'
import Router from "koa-router"
import { getOneUserByUsername, curUser } from "../service/user"
import { getSkipInfo, getFriendList, requestShip, rejectSkip, sureSkip, deleteFriend } from "../service/friend"

const router = new Router({
  prefix: "/friend"
})

const friendSchame = Joi.object({
  username: Joi.string().required().max(16).min(6).pattern(/^[\u4E00-\u9FA5A-Za-z0-9]+$/)
})

/** 请求添加好友 */
router.post("/:username/skip_ask", async (ctx: Context) => {
  const { error, value } = friendSchame.validate(ctx.params)
  if (error) return global.PROCESS.parameterException(error.message)
  const user = await curUser(ctx)
  if (user.username === value.username) return global.PROCESS.forbiddenException(10414)
  const friend = await getOneUserByUsername(value.username)
  await requestShip(user.id, friend.id)
  global.PROCESS.success()
})

/** 拒绝好友申请 */
router.post("/:username/skip_reject", async (ctx: Context) => {
  const { error, value } = friendSchame.validate(ctx.params)
  if (error) return global.PROCESS.parameterException(error.message)
  const user = await curUser(ctx)
  if (user.username === value.username) return global.PROCESS.forbiddenException(10414)
  const friend = await getOneUserByUsername(value.username)
  await rejectSkip(user.id, friend.id)
  global.PROCESS.success()
})

/** 同意好友申请 */
router.post("/:username/skip_sure", async (ctx: Context) => {
  const { error, value } = friendSchame.validate(ctx.params)
  if (error) return global.PROCESS.parameterException(error.message)
  const user = await curUser(ctx)
  if (user.username === value.username) return global.PROCESS.forbiddenException(10414)
  const friend = await getOneUserByUsername(value.username)
  await sureSkip(user.id, friend.id)
  global.PROCESS.success()
})

/** 获取好友请求信息 */
router.get("/skip_info", async (ctx: Context) => {
  const user = await curUser(ctx)
  const skipInfo = await getSkipInfo(user)
  global.PROCESS.success({ skipInfo })
})

/** 获取好友列表 */
router.get("/list", async (ctx: Context) => {
  const user = await curUser(ctx)
  const friendList = await getFriendList(user)
  global.PROCESS.success({ friendList })
})

/** 删除好友（不可恢复） */
router.delete("/:username", async (ctx: Context) => {
  const { error, value } = friendSchame.validate(ctx.params)
  if (error) return global.PROCESS.parameterException(error.message)
  const user = await curUser(ctx)
  const friend = await getOneUserByUsername(value.username)
  await deleteFriend(user.id, friend.id)
  global.PROCESS.success()
})

export default router
