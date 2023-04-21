import log4js from 'log4js'
import { isPlainObject } from '../tool'
import logConfig from './log-config'
import CONFIG from '@/config'
import { curUser } from '@/app/service/user'

const ENV = CONFIG.ENV

// loading log config
log4js.configure(logConfig)

const infoLogger = log4js.getLogger('info')
const errorLogger = log4js.getLogger('error')

// format log text
const formatText = {
  // request log
  request: async function (ctx: any) {
    let logText = ''
    logText += `\n==================== REQUEST BEGIN ====================`
    try {
      const user = await curUser(ctx)
      logText += `\n[USER]\n${JSON.stringify({
        id: user.id,
        account: user.account,
        username: user.username
      }, null, 2)}`
    } catch(e) {}
    logText += `\n[REQUEST]`
    logText += `\n${JSON.stringify(ctx.request, null, 2)}`
    logText += `\n[REQUEST QUERY STRING]\n${JSON.stringify(ctx.request.queryString, null, 2)}`
    logText += `\n[REQUEST PARAMS]\n${JSON.stringify(ctx.request.params, null, 2)}`
    logText += `\n[REQUEST BODY]\n${JSON.stringify(ctx.request.body, null, 2)}`
    if (ENV === 'development') console.log(logText)
    return logText
  },

  // response log
  response: function (ctx: any) {
    let logText = ''
    logText += `\n[RESPONSE]`
    logText += `\n${JSON.stringify(ctx.response.body, null, 2)}`
    logText += `\n==================== RESPONSE END ====================\n`
    if (ENV === 'development') console.log(logText)
    return logText
  },

  // sql query
  query: function (sql: string, timing?: number) {
    let logText = ''
    logText += `\n[SQL QUERY LOG BEGIN]`
    logText += `\n  [SQL]: ${sql}`
    logText += `\n  [SQLTiming]: ${timing}`
    logText += `\n[SQL QUERY LOG END]\n`
    if (ENV === 'development') console.log(logText)
    return logText
  },

  // 错误日志
  error: function (...arg: any) {
    let logText = ''
    logText += `\n!!!!!!!!!!!!!!!!!!!! ERROR LOG BEGIN !!!!!!!!!!!!!!!!!!!!`
    for (let i = 0, len = arg.length; i < len; i++) {
      let info = arg[i]
      if (isPlainObject(info)) info = JSON.stringify(info)
      logText += `\n  [errorInfoLog]: ${info}`
      console.log(info)
    }
    logText += `\n!!!!!!!!!!!!!!!!!!!! ERROR LOG END !!!!!!!!!!!!!!!!!!!!\n`
    return logText
  },
}

interface LoggerOptions {
  request: Function
  response: Function
  query: (sql: string, timing?: number) => void
  error: Function
  [x: string]: any
}

const Logger: LoggerOptions = {
  /** request log */
  request: function (ctx: any) {
    infoLogger.info(formatText.request(ctx))
  },

  /** response log */
  response: function (ctx: any) {
    infoLogger.info(formatText.response(ctx))
  },

  /** sql query log */
  query: function (sql: string, timing?: number) {
    infoLogger.info(formatText.query(sql, timing))
  },

  /** sql error log */
  error: function (...arg: any) {
    errorLogger.error(formatText.error(...arg))
  },
}
export default Logger
