import type { Context } from "koa"
import Joi from 'joi'
import Router from "koa-router"
import { createOneUser, getOneUserById, getOneUserByAccount } from "../service/user"
import { IUser } from "../model"
import { generateToken } from "@/core/auth"

const router = new Router({
  prefix: "/user"
})

const userSchame = Joi.object<IUser>({
  username: Joi.string().required().max(16).min(6).pattern(/^[一-龠ぁ-んァ-ヴー\u4E00-\u9FA5A-Za-z0-9]+$/),
  account: Joi.string().required().max(16).min(6).pattern(/^\w+$/),
  password: Joi.string().required().length(64),
})

const userPayloadSchame = Joi.object<Omit<IUser, "username">>({
  account: Joi.string().required().max(16).min(6).pattern(/^\w+$/),
  password: Joi.string().required().length(64),
})

router.post("/register", async (ctx: Context) => {
  const { error, value } = userSchame.validate(ctx.request.body)
  if (error) return global.PROCESS.parameterException(error.message)
  await createOneUser(value)
  global.PROCESS.success()
})

router.post("/login", async (ctx: Context) => {
  const { error, value } = userPayloadSchame.validate(ctx.request.body)
  if (error) return global.PROCESS.parameterException(error.message)
  const user = await getOneUserByAccount(value.account)
  if (user.password !== value.password) global.PROCESS.notFoundException(10410)
  if (user.isLogin) global.PROCESS.forbiddenException(10411)
  user.isLogin = true
  await user.save()
  global.PROCESS.success({ token: generateToken(user.id) })
})

router.get("/logout", async (ctx: Context) => {
  const user = await getOneUserById(ctx.state.user.id)
  if (!user.isLogin) global.PROCESS.forbiddenException(10412)
  user.isLogin = false
  await user.save()
  global.PROCESS.success()
})

export default router