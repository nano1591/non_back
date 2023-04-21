import type { Dialect } from 'sequelize'
import { Sequelize } from 'sequelize'
import CONFIG from '@/config'

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
          logging: false
        }
      )
    }
    return SequelizeClient._INSTANCE
  }
}