import type { Context } from 'koa'
import Router from 'koa-router'
import { curUser } from '../service/user'
import { getSkipList, getFriendList } from '../service/friend'

const router = new Router({
  prefix: '/friend'
})

/** 获取好友请求信息 */
router.get('/skip_info', async (ctx: Context) => {
  const user = await curUser(ctx)
  const skipInfo = await getSkipList(user)
  global.PROCESS.success({ skipInfo })
})

/** 获取好友列表 */
router.get('/list', async (ctx: Context) => {
  const user = await curUser(ctx)
  const friendList = await getFriendList(user)
  global.PROCESS.success({ friendList })
})

export default router
