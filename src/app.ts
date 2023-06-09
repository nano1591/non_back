import Koa from 'koa'
import initDB from '@/app/model'
import CONFIG from './config'
import cors from '@koa/cors'
import KoaBody from 'koa-body'
import compose from 'koa-compose'
import router from '@/app/api'
import jwtMiddlewate from '@/core/auth'
import processMiddleware from '@/core/result/process-middleware'
import { logMiddlewate } from '@/core/log/log-middlewate'
import { Process } from '@/core/result/process'
import jwt from 'koa-jwt'
import { initSocket } from './app/socket'

const startKoa = async () => {
  const app = new Koa()

  app.use(
    compose([
      // 跨域
      cors(),
      // 日志
      logMiddlewate,
      // 由error生成返回值
      processMiddleware,
      jwtMiddlewate,
      // token解析
      jwt({ secret: CONFIG.JWT.JWT_SECRET }).unless({
        path: [/^\/user\/(login|register)/, /^\/config/]
      }),
      // 静态文件
      require('koa-static')(__dirname + '/public'),
      // 解析请求体
      KoaBody({ multipart: true }),
      // 路由
      router
    ])
  )

  global.PROCESS = new Process()

  await initDB()

  app.on('error', (error, ctx) => {
    console.log(error, ctx)
  })

  const httpServer = app.listen(CONFIG.PORT, () => {
    console.log(`koa runs in ${CONFIG.BASE_URL}:${CONFIG.PORT}`)
  })

  initSocket(httpServer)
}

startKoa()
