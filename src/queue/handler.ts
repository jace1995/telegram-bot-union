import { IN } from '@jace1995/postgres-helpers'
import { AssignTask, InvitationParticipants, LeaveCommunity, NewRole } from '../types/api'
import { Alliance, ID, Member, t, TaskCommunity } from '../types/models'
import { community, task, QueueContext, user } from './context'
import { QueueAction } from './types'

const joinAlliance = (ctx: QueueContext, participants: InvitationParticipants) => (
  ctx.queue.lock(
    () => (
      ctx.pg.insert<Alliance>(v => ({
        table: t.alliance,
        value: {
          [t.invitation.alliance_id]: v(participants.allianceId),
          [t.invitation.ally_id]: v(participants.allyId),
        },
      }))
    ),
    community(participants.allianceId),
    community(participants.allyId),
  )
)

const leaveAlliance = (ctx: QueueContext, participants: InvitationParticipants) => (
  ctx.queue.lock(
    () => (
      ctx.pg.delete<Alliance>(v => ({
        table: t.alliance,
        where: {
          [t.invitation.alliance_id]: v(participants.allianceId),
          [t.invitation.ally_id]: v(participants.allyId),
        },
      }))
    ),
    community(participants.allianceId),
    community(participants.allyId),
  )
)

const assignTask = (ctx: QueueContext, props: AssignTask) => (
  ctx.queue.lock(
    () => (
      ctx.pg.insert<TaskCommunity>(v => ({
        table: t.task_community,
        value: props.recipientsIds.map(id => ({
          [t.task_community.task_id]: v(props.taskId),
          [t.task_community.community_id]: v(id),
        }))
      }))
    ),
    task(props.taskId),
  )
)

const joinCommunity = (ctx: QueueContext, membership: Member) => (
  ctx.queue.lock(
    () => (
      ctx.pg.insert<Member>(v => ({
        table: t.member,
        value: {
          [t.member.user_id]: v(membership.user_id),
          [t.member.community_id]: v(membership.community_id),
          [t.member.role]: v(membership.role),
        },
      }))
    ),
    user(membership.user_id),
    community(membership.community_id),
  )
)

const leaveCommunity = (ctx: QueueContext, membership: LeaveCommunity) => (
  ctx.queue.lock(
    () => (
      ctx.pg.delete<Member>(v => ({
        table: t.member,
        where: {
          [t.member.user_id]: v(membership.userId),
          [t.member.community_id]: v(membership.communityId),
        },
      }))
    ),
    user(membership.userId),
    community(membership.communityId),
  )
)

const leaveAllCommunities = (ctx: QueueContext, userId: ID) => (
  ctx.queue.lock(
    () => (
      ctx.pg.delete<Member>(v => ({
        table: t.member,
        where: {
          [t.member.user_id]: v(userId),
        },
      }))
    ),
    user(userId),
  )
)

const changeRole = (ctx: QueueContext, membership: NewRole) => (
  ctx.queue.lock(
    () => (
      ctx.pg.update<Member>(v => ({
        table: t.member,
        value: {
          [t.member.role]: v(membership.role),
        },
        // ! refactoring "in"
        where: (
          `${t.member.community_id} = ${v(membership.communityId)} and ` +
          `${t.member.user_id} ${IN(membership.membersIds.map(v))}`
        ),
        returning: true,
      }))
    ),
    community(membership.communityId),
    ...membership.membersIds.map(userId => user(userId)),
  )
)

export const handle = (ctx: QueueContext): Promise<unknown> => {
  switch (ctx.event[0]) {
    case QueueAction.join_alliance:
      return joinAlliance(ctx, ctx.event[1])

    case QueueAction.leave_alliance:
      return leaveAlliance(ctx, ctx.event[1])

    case QueueAction.assign_task:
      return assignTask(ctx, ctx.event[1])


    case QueueAction.join_community:
      return joinCommunity(ctx, ctx.event[1])

    case QueueAction.leave_community:
      return leaveCommunity(ctx, ctx.event[1])

    case QueueAction.leave_all_communities:
      return leaveAllCommunities(ctx, ctx.event[1])

    case QueueAction.change_role:
      return changeRole(ctx, ctx.event[1])
  }
}
