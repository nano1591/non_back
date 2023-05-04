import compose from 'koa-compose'
import userRouter from './user'
import friendRouter from './friend'
import configRouter from './config'

export default compose([
  userRouter.routes(),
  userRouter.allowedMethods(),
  friendRouter.routes(),
  friendRouter.allowedMethods(),
  configRouter.routes(),
  configRouter.allowedMethods()
])
