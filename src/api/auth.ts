import { COUNT, PostgresDatabaseInterface } from '@jace1995/postgres-helpers'
import { generateID, generateUniqueID } from '../helpers/utils'
import { Action } from '../types/actions'
import { User, t } from '../types/models'

// ! pg.js самостоятельно не парсит массивы
const parseUser = (user: User): User => {
  const steps = String(user.steps)
  user.steps = steps.substring(1, steps.length - 1).split(',') as Action[]
  return user
}

export const auth = async (pg: PostgresDatabaseInterface, chatID: number) => {
  const user = await pg.select<User>(v => ({
    table: t.user,
    where: {
      [t.user.chat]: v(chatID)
    },
    first: true,
  }))

  if (user) {
    return parseUser(user)
  }

  const userId = await generateUniqueID(id => pg.select(v => ({
    table: t.user_ids,
    where: {
      [t.user_ids.id]: v(id)
    },
    first: `${COUNT()} = 0`
  })))

  const newUser = await pg.insert<User>(v => ({
    table: t.user,
    value: {
      [t.user.id]: v(userId),
      [t.user.chat]: v(chatID),
    },
    returning: true,
  }))

  return parseUser(newUser)
}
