import type { Context } from 'koa'
import Logger from '../log'
import { isNumber } from '../tool'
import CODE from './process-code'
import { Exception, Success } from './process-state'

const UNDEDINED_ERROR = 'undefined errorCode'

/**
 * 处理结果处理中间件
 */
export default async (ctx: Context, next: Function) => {
  try {
    await next()
  } catch (error: any) {
    const isSuccess = error instanceof Success
    const isException = error instanceof Exception
    if (isSuccess) {
      ctx.status = 200
      ctx.body = {
        code: 0,
        message: CODE.get(0),
        data: error.data
      }
    } else if (isException) {
      ctx.status = error.status
      ctx.body = {
        code: getCode(error),
        message: getMessage(error)
      }
    } else {
      ctx.status = 500
      ctx.body = {
        code: 10000,
        message: CODE.get(10000),
      }
      Logger.error('SERVER_ERROR', error)
    }
  }
}

/**
 * Get custom exception message
 * @param error
 * @returns message
 */
function getMessage(error: any): string {
  const message = isNumber(error.code)
    ? error.message || CODE.get(error.code) || UNDEDINED_ERROR
    : error.code
  return message
}

/**
 * Get custom error code
 * @param error
 * @returns code
 */
function getCode(error: any): number {
  const code = isNumber(error.code) ? error.code : 10000
  return code
}
