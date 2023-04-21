import compose from 'koa-compose'
import userRouter from "./user"
import friendRouter from './friend'
import { Context } from 'vm'

export default compose([
  userRouter.routes(),
  userRouter.allowedMethods(),
  friendRouter.routes(),
  friendRouter.allowedMethods()
])