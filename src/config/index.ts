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
  BASE_URL: 'http://10.0.95.220',
  JWT: {
    JWT_SECRET: 'nano',
    EXPIRES_IN: '30d',
  },
  DATABASE: {
    DIALECT: 'postgres',
    DB_NAME: 'nano-game-db',
    HOST: '10.0.95.220',
    PORT: 32768,
    USER: 'postgres',
    PASSWORD: 'postgrespw',
    TIMEZONE: '+08:00',
  },
  ROOM: {
    MAX_ITEM_SIZE: 3
  }
}

export default CONFIG
