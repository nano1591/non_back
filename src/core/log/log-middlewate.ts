import type { Context } from 'koa'
import Logger from '.'

/**
 * request和response输出
 */
export const logMiddlewate =  async (ctx: Context, next: Function) => {
  Logger.request(ctx)
  await next()
  Logger.response(ctx)
}
