import { ARRAY, IN, jsonKeys, pgCast, PostgresDatabaseInterface } from '@jace1995/postgres-helpers'
import { SqlProps } from '@jace1995/postgres-helpers/build/types'
import { types } from '../setup/types'
import { Action } from '../types/actions'
import { AvailableChats, UpdateUserValue, UserApiInterface } from '../types/api'
import { t, User } from '../types/models'

export class UserApi implements UserApiInterface {
  constructor(private pg: PostgresDatabaseInterface) { }

  async rememberStep(id: number, step: Action) {
    await this.pg.update<User>(v => ({
      table: t.user,
      value: {
        [t.user.steps]: `array_append(${t.user.steps}, ${v(step)})`,
      },
      where: {
        id: v(id)
      },
    }))
  }

  resetStep(id: number) {
    return this.setStep(id)
  }
  
  async setStep(id: number, action?: Action, payload?: unknown) {
    await this.pg.update<User>(v => ({
      table: t.user,
      value: {
        [t.user.action]: v(action ?? Action.start),
        [t.user.payload]: v(payload ?? null),
      },
      where: {
        [t.user.id]: v(id)
      },
    }))
  }

  async findById(userId: number) {
    return await this.pg.select<User>(v => ({
      table: t.user,
      where: { [t.user.id]: v(userId) },
      first: true,
    }))
  }

  availableChats(userIds: User['id'][]): Promise<AvailableChats[]> {
    return this.pg.select<User>(v => ({
      table: t.user,
      columns: [t.user.id, t.user.chat],
      where: `${t.user.id} ${IN(userIds.map(v))} and ${t.user.locked} = false`, // ! refactoring in
    }))
  }

  async update(userId: User['id'], value: UpdateUserValue) {
    const editableProps = jsonKeys<UpdateUserValue>()
    
    await this.pg.update(v => ({
      table: t.user,
      value: (() => {
        const props: SqlProps<UpdateUserValue> = {}

        if (editableProps.locked in value) {
          props[t.user.locked] = v(value.locked)
        }

        if (editableProps.forceLocking in value) {
          props[t.user.force_locking] = v(value.forceLocking)
        }

        if (editableProps.emergencyUnlocking in value) {
          props[t.user.emergency_unlocking] = v(value.emergencyUnlocking)
        }

        if (editableProps.lockPasswordHash in value) {
          props[t.user.lock_password_hash] = v(value.lockPasswordHash)
        }

        // if (value.clearSteps) {
        //   props[t.user.steps] = pgCast(ARRAY(), types.steps)
        // }

        return props
      })(),
      where: {
        [t.user.id]: v(userId)
      },
    }))
  }

  async clearSettings(userId: User['id']) {
    await this.pg.update(v => ({
      table: t.user,
      value: {
        [t.user.locked]: v(false),
        [t.user.force_locking]: v(false),
        [t.user.emergency_unlocking]: v(false),
        [t.user.lock_password_hash]: v(null),
        [t.user.steps]: pgCast(ARRAY(), types.steps),
      },
      where: {
        [t.user.id]: v(userId)
      },
    }))
  }
}
