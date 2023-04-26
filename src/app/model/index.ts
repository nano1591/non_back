import { SequelizeClient } from '@/core/db'
import Logger from '@/core/log'

export default async () => {
  try {
    await SequelizeClient.INSTANCE.authenticate()
    await SequelizeClient.INSTANCE.sync({ alter: true })
  } catch (e) {
    SequelizeClient.INSTANCE.close()
    Logger.error("数据库连接失败", e)
    throw Error()
  }
}

export * from './user'
export * from './friend-ship'
export * from './room'
export * from './room-item'
