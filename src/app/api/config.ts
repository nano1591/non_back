import CONFIG from '@/config'
import Router from 'koa-router'

const router = new Router({
  prefix: '/config'
})

/** 获取好友请求信息 */
router.get('/client/version', async () => {
  global.PROCESS.success({ version: CONFIG.CLIENT.VERSION })
})
