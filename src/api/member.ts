import { COUNT, IN, join, PostgresDatabaseInterface } from '@jace1995/postgres-helpers'
import { QueueAction } from '../queue/types'
import { IsLastLeader, LeaveCommunity, MemberApiInterface, NewRole, LeadersForBlock } from '../types/api'
import { t, Member, User, Community, Role, IdProvider } from '../types/models'
import { Queue, withLock } from './utils'

export class MemberApi implements MemberApiInterface {
  constructor(
    private pg: PostgresDatabaseInterface,
    private queue: Queue
  ) { }

  async joinCommunity(membership: Member) {
    await this.queue.add([QueueAction.join_community, membership])
  }

  async leaveCommunity(membership: LeaveCommunity) {
    await this.queue.add([QueueAction.leave_community, membership])
  }

  async leaveAllCommunities(userId: User['id']) {
    await this.queue.add([QueueAction.leave_all_communities, userId])
  }

  async changeRole(membership: NewRole) {
    await this.queue.add([QueueAction.change_role, membership])
  }

  isLastLeader(membership: IsLastLeader) {
    return this.pg.select<Member, boolean>(v => ({
      table: t.member,
      where: {
        [t.member.community_id]: v(membership.communityId),
        [t.member.user_id]: v(membership.leaderId),
      },
      first: `${COUNT()} = 1`,
    }))
  }

  async lastLeaderCommunities(userId: User['id']) {
    const counterKey = 'leaders'
    const resultKey = 'result'
    const idsKey = `array_agg(${t.member.community_id})`
    
    const result = await this.pg.select<Member, Community['id'][]>(v => ({
      table: t.member,
      columns: {
        [counterKey]: COUNT(t.member.community_id),
        [resultKey]: idsKey,
      },
      where: {
        [t.member.user_id]: v(userId),
        [t.member.role]: v(Role.leader),
      },
      group: t.member.community_id,
      having: {
        [COUNT(t.member.community_id)]: v(1),
      },
      first: true,
    }))

    return result[resultKey]
  }

  leadersForBlock(membership: LeadersForBlock) {
    return this.pg.select<User>(v => ({
      table: t.user,
      join: join({
        table: t.member,
        on: `${t.member.user_id} = ${t.user.id}`,
      }),
      where: (
        `${t.member.community_id} = ${v(membership.communityId)}} and ` +
        `${t.member.user_id} ${IN(membership.leaderIds.map(v))}} and ` + // ! refactoring in
        `${t.user.locked} = ${v(false)} and ` +
        `${t.user.force_locking} = ${v(true)}`
      ),
    }))
  }

  findIds(communityIds: Community['id'][], roles: Role[]) {
    return this.pg.select<Member, IdProvider>(v => ({
      table: t.member,
      columns: [t.member.user_id],
      where: ( // ! refactoring in
        `${t.member.community_id} ${IN(communityIds.map(v))} and ` +
        `${t.member.role} ${IN(roles.map(v))}`
      ),
      group: t.member.user_id,
    }))
  }
}
