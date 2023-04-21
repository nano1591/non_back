import { Context } from 'koa'
import { User, IUser } from '../model'
import { Op } from 'sequelize'

export const createOneUser = async (newOne: IUser): Promise<User> => {
  const one = await User.findOne({
    where: {
      [Op.or]: [
        { username: newOne.username },
        { account: newOne.account }
      ]
    }
  })
  if (one) {
    global.PROCESS.parameterException(10409)
  }
  return await User.create(newOne)
}

export const updateOneUser = async (newOne: User): Promise<User> => {
  const one = await User.findByPk(newOne.id)
  if (!one) {
    global.PROCESS.notFoundException(10410)
  }
  return await one!.update(newOne)
}

export const getOneUserById = async (id: number): Promise<User> => {
  const one = await User.findByPk(id)
  if (!one) {
    global.PROCESS.notFoundException(10410)
  }
  return one!
}

export const getOneUserByUsername = async (username: string): Promise<User> => {
  const one = await User.findOne({ where: { username } })
  if (!one) {
    global.PROCESS.notFoundException(10410)
  }
  return one!
}

export const getOneUserByAccount = async (account: string): Promise<User> => {
  const one = await User.findOne({ where: { account } })
  if (!one) {
    global.PROCESS.notFoundException(10410)
  }
  return one!
}

export const deleteUserById = async (id: number): Promise<boolean> => {
  const numDeleted = await User.destroy({ where: { id } })
  return !!numDeleted
}

export const curUser = async (ctx: Context): Promise<User> => {
  return await getOneUserById(ctx.state.user.id)
}
