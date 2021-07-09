import { randomInt } from 'crypto'
import { Context } from '../types/context'
import { Community, ID, MemberInfo, Role, User } from '../types/models'
import { availableRoles } from './user'

export const findCommunity = async (
  ctx: Context,
  communityId: Community['id'],
  type?: Community['type']
): Promise<Community | null> => {
  try {
    const community = await ctx.api.community.findById(communityId)

    if (type && community.type !== type) {
      return null
    }

    return community
  }
  catch {
    return null
  }
}

export const membersByRole = (members: MemberInfo, role: Role): User['id'][] => {
  switch (role) {
    case Role.leader:
      return members.leaders

    case Role.activist:
      return members.activists

    case Role.verified:
      return members.verifieds

    case Role.member:
      return members.members
  }
}

export const filterMembersByAvailableRoles = (members: MemberInfo, role: Role): User['id'][] => (
  availableRoles[role].reduce(
    (array, r) => [...array, ...membersByRole(members, r)],
    [] as User['id'][]
  )
)

export const generateID = () => Number(
  [
    randomInt(1, 9),
    ...new Array(9).fill(1).map(() => randomInt(0, 9))
  ].join('')
)

export const generateUniqueID = async (validID: (id: number) => Promise<boolean>) => {
  while (true) {
    const id = generateID()

    if (validID(id)) {
      return id
    }
  }
}

export const validID = (id: ID) => (
  Number.isInteger(id) &&
  String(id).length === 10
)

export const checkbox = (selected: boolean) => (
  selected ? '✅' : '☑️'
)

