import type { Context } from 'koa'
import Logger from '.'

/**
 * request和response输出
 */
export const logMiddlewate = async (ctx: Context, next: () => Promise<void>) => {
  Logger.request(ctx)
  await next()
  Logger.response(ctx)
}
