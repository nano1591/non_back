import type { Context } from 'koa'
import Logger from '.'

/**
 * request和response输出
 */
export const resLogMiddlewate =  async (ctx: Context, next: Function) => {
  await next()
  Logger.response(ctx)
}

export const reqLogMiddlewate = async (ctx: Context, next: Function) => {
  Logger.request(ctx)
  await next()
}
