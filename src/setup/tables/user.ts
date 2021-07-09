import {
  createTable, column, columnAutoupdate,
  full, join, pgCast, pgType, select, ARRAY, insert,
} from '@jace1995/postgres-helpers'
import { dependency } from '@jace1995/postgres-helpers/build/types' // ! refactoring
import { Action } from '../../types/actions'
import { Community, CommunityInfo, IdProvider, Member, t, User } from '../../types/models'
import { Enums, types } from '../types'

export const createUserTable = createTable<User>(t.user, {
  id: column<User>({
    type: pgType.pk,
    pk: true,
    readonly: false,
    afterUpdate: (_, row) => insert<IdProvider>({
      table: t.user_ids,
      value: {
        [t.user_ids.id]: row.id
      },
    })
  }),
  chat: column({
    type: pgType.pk,
    unique: true,
    index: true,
    readonly: true,
  }),
  steps: column({
    type: types.steps,
    default: () => pgCast(ARRAY(), types.steps),
  }),
  action: column({
    type: pgType.custom(Enums.action),
    default: Action.start,
  }),
  payload: column({
    type: pgType.jsonb,
    optional: true,
  }),
  
  locked: column({
    type: pgType.boolean,
    default: false,
  }),
  force_locking: column({
    type: pgType.boolean,
    default: false,
  }),
  emergency_unlocking: column({
    type: pgType.boolean,
    default: false,
  }),
  lock_password_hash: column({
    type: pgType.varchar(255),
    optional: true,
  }),

  memberships: columnAutoupdate<Member, CommunityInfo>({
    select: {
      table: t.member,
      columns: {
        [t.community_info.id]: full(t.community).id,
        [t.community_info.name]: full(t.community).name,
        [t.community_info.type]: full(t.community).type,
        [t.community_info.closed]: full(t.community).closed,
        [t.community_info.role]: t.member.role,
      },
      join: join<Community>({
        table: t.community,
        on: {
          [full(t.community).id]: t.member.community_id
        },
      }),
      where: {
        [full(t.member).user_id]: full(t.user).id
      },
    },
    dependencies: [
      dependency<User, Community>({
        table: t.community,
        keys: [t.community.name],
        // ! refactoring "in"
        target: row => `${t.user.id} in ${
          select<Member>({
            table: t.member,
            columns: [t.member.user_id],
            where: {
              [full(t.member).community_id]: row.id
            },
            inside: true,
          })
        }`
      }),
      dependency<User, Member>({
        table: t.member,
        keys: [t.member.role],
        target: row => ({
          [full(t.user).id]: row.user_id
        }),
      }),
    ],
  }),
}, {
  afterInsert: row => insert<IdProvider>({
    table: t.user_ids,
    value: {
      [t.user_ids.id]: row.id
    },
  })
})
