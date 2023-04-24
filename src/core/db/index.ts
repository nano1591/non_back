import type { Dialect } from 'sequelize'
import { Sequelize } from 'sequelize'
import CONFIG from '@/config'
import Logger from '../log'

const DATABASE = CONFIG.DATABASE

export class SequelizeClient {
  private static _INSTANCE: Sequelize | null = null

  static get INSTANCE(): Sequelize {
    if (SequelizeClient._INSTANCE === null) {
      SequelizeClient._INSTANCE = new Sequelize(
        DATABASE.DB_NAME,
        DATABASE.USER,
        DATABASE.PASSWORD,
        {
          dialect: DATABASE.DIALECT as Dialect,
          host: DATABASE.HOST,
          port: DATABASE.PORT,
          timezone: DATABASE.TIMEZONE,
          logging: Logger.query
        }
      )
    }
    return SequelizeClient._INSTANCE
  }
}