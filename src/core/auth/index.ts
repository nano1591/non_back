import type { Context } from 'koa'
import jwt from 'jsonwebtoken'
import CONFIG from '@/config'

export default async (ctx: Context, next: Function) => {
  try {
    await next()
  } catch (e: any) {
    if (e?.status == 401) {
      global.PROCESS.unAuthenticatedException(10401)
    } else {
      throw e
    }
  }
}

export function generateToken(id: number) {
  return jwt.sign({ id }, CONFIG.JWT.JWT_SECRET, { expiresIn: CONFIG.JWT.EXPIRES_IN })
}