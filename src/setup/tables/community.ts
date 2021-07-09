import {
  createTable, column, pk, columnAutoupdate,
  full, join, pgType, select,
} from '@jace1995/postgres-helpers'
import { dependency } from '@jace1995/postgres-helpers/build/types' // ! refactoring
import {
  t, Community, Member, Alliance,
  AllianceInfo, AllyInfo, MemberInfo, Role,
} from '../../types/models'
import { Enums, types } from '../types'

const selectMembers = (role?: Role) => select<Member>({
  table: t.member,
  ...role ? {
    where: {
      [t.member.role]: `'${role}'`,
      [t.member.community_id]: full(t.community).id,
    }
  } : {},
  first: (
    `case when array_agg(${t.member.user_id}) is null ` +
    `then array[]::bigint[] ` +
    `else array_agg(${t.member.user_id}) end`
  ),
  inside: true,
})

export const createCommunityTable = createTable<Community>(t.community, {
  id: pk(),
  type: column(pgType.custom(Enums.community_type)),
  name: column(pgType.varchar(types.length.comunityName)),
  description: column({
    type: pgType.varchar(types.length.comunityDescription),
    optional: true,
  }),
  image: column({
    type: pgType.varchar(255),
    optional: true,
  }),
  closed: column({
    type: pgType.boolean,
    default: false,
  }),
  locations: column({
    type: pgType.jsonb,
    default: [],
  }),

  users: columnAutoupdate<Member, MemberInfo>({
    select: {
      table: t.member,
      limit: 1,
      columns: {
        [t.member_info.leaders]: selectMembers(Role.leader),
        [t.member_info.activists]: selectMembers(Role.activist),
        [t.member_info.verifieds]: selectMembers(Role.verified),
        [t.member_info.members]: selectMembers(Role.member),
        [t.member_info.all]: selectMembers(),
      },
    },
    dependencies: [
      dependency<Community, Member>({
        table: t.member,
        keys: [t.member.role],
        target: row => ({
          [full(t.community).id]: row.community_id
        })
      }),
    ],
    first: true,
  }),

  alliances: columnAutoupdate<Alliance, AllianceInfo>({
    select: {
      table: t.alliance,
      columns: {
        [t.alliance_info.id]: full(t.alliance).alliance_id,
        [t.alliance_info.name]: `"parent".${t.community.name}`, // ! refactoring
      },
      join: join<Community>({
        table: `${t.community} as "parent"`,
        on: {
          [`"parent".${t.community.id}`]: full(t.alliance).alliance_id
        },
      }),
      where: {
        [full(t.alliance).ally_id]: full(t.community).id
      },
    },
    dependencies: [
      dependency<Community, Alliance>({
        table: t.alliance,
        target: row => ({
          [full(t.community).id]: row.ally_id
        })
      }),
    ],
  }),

  allies: columnAutoupdate<Alliance, AllyInfo>({
    select: {
      table: t.alliance,
      columns: {
        [t.ally_info.id]: full(t.alliance).ally_id,
        [t.ally_info.name]: `"parent".${t.community.name}`,
      },
      join: join<Community>({
        table: `${t.community} as "parent"`, // ! refactoring
        on: {
          [`"parent".${t.community.id}`]: full(t.alliance).ally_id
        },
      }),
      where: {
        [full(t.alliance).alliance_id]: full(t.community).id
      },
    },
    dependencies: [
      dependency<Community, Alliance>({
        table: t.alliance,
        target: row => ({
          [full(t.community).id]: row.alliance_id
        })
      }),
    ],
  }),
})
