import type { Context } from 'koa'
import Joi from 'joi'
import Router from 'koa-router'
import { createOneUser, getOneUserById, getOneUserByAccount, searchUsers } from '../service/user'
import { IUser } from '../model'
import { generateToken } from '@/core/auth'
import { dissolveRoom } from '../service/room'

const router = new Router({
  prefix: '/user'
})

const userSchame = Joi.object<IUser>({
  username: Joi.string()
    .required()
    .max(16)
    .min(6)
    .pattern(/^[一-龠ぁ-んァ-ヴー\u4E00-\u9FA5A-Za-z0-9]+$/),
  account: Joi.string().required().max(16).min(6).pattern(/^\w+$/),
  password: Joi.string().required().length(64)
})

const userPayloadSchame = Joi.object<Omit<IUser, 'username'>>({
  account: Joi.string().required().max(16).min(6).pattern(/^\w+$/),
  password: Joi.string().required().length(64)
})

router.post('/register', async (ctx: Context) => {
  const { error, value } = userSchame.validate(ctx.request.body)
  if (error) return global.PROCESS.parameterException(error.message)
  await createOneUser(value)
  global.PROCESS.success()
})

router.post('/login', async (ctx: Context) => {
  const { error, value } = userPayloadSchame.validate(ctx.request.body)
  if (error) return global.PROCESS.parameterException(error.message)
  const user = await getOneUserByAccount(value.account)
  if (user.password !== value.password) global.PROCESS.notFoundException(10410)
  if (user.socketId) global.PROCESS.forbiddenException(10411)
  global.PROCESS.success({
    id: user.id,
    username: user.username,
    account: user.account,
    icon: user.icon,
    status: user.status,
    token: generateToken(user.id)
  })
})

router.get('/logout', async (ctx: Context) => {
  const user = await getOneUserById(ctx.state.user.id)
  if (!user.socketId) global.PROCESS.forbiddenException(10412)
  user.socketId = ''
  await user.save()
  await dissolveRoom(user.id)
  global.PROCESS.success()
})

const usernameSchame = Joi.object({
  keyword: Joi.string()
    .required()
    .max(16)
    .pattern(/^[一-龠ぁ-んァ-ヴー\u4E00-\u9FA5A-Za-z0-9]+$/)
})

/** 搜索好友 */
router.post('/search', async (ctx: Context) => {
  const { error, value } = usernameSchame.validate(ctx.request.body)
  if (error) return global.PROCESS.parameterException(error.message)
  const resultList = await searchUsers(value.keyword)
  global.PROCESS.success({ resultList })
})

export default router
