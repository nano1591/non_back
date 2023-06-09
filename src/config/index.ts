/**
 * app env config
 * You set the parameter set NODE_ENV=production at startup and load different environments
 * 1. package.json scripts add `"prod": "cross-env NODE_ENV=production nodemon",`
 * 2. here get env decided to use different data `const env = process.env.NODE_ENV`
 *
 * You can refer to `template-full`
 */
const CONFIG = {
  ENV: 'development',
  PORT: 3100,
  BASE_URL: 'http://localhost',
  JWT: {
    JWT_SECRET: 'nano',
    EXPIRES_IN: '30d'
  },
  DATABASE: {
    DIALECT: 'postgres',
    DB_NAME: 'nano-game-db',
    HOST: 'localhost',
    PORT: 32768, // 32768 5432
    USER: 'postgres',
    PASSWORD: 'postgrespw', // postgrespw postgres
    TIMEZONE: '+08:00'
  },
  ROOM: {
    MAX_ITEM_SIZE: 3
  },
  CLIENT: {
    VERSION: 'V1.0.0',
    SEARCH_LIMIT: 100
  }
}

export default CONFIG
