import { createTable, column, pgType } from '@jace1995/postgres-helpers'
import { Member, t } from '../../types/models'
import { Enums, types } from '../types'

export const createMemberTable = createTable<Member>(t.member, {
  user_id: column({
    type: pgType.pk,
    pk: true,
    fk: {
      tableJoin: t.user,
      key: t.user.id,
    },
  }),
  community_id: column(types.pkCommunityFK),
  role: column(pgType.custom(Enums.role)),
})
