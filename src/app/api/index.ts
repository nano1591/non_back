import compose from 'koa-compose'
import userRouter from "./user"
import friendRouter from './friend'

export default compose([
  userRouter.routes(),
  userRouter.allowedMethods(),
  friendRouter.routes(),
  friendRouter.allowedMethods()
])