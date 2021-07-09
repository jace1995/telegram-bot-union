import { AssignTask, InvitationParticipants, LeaveCommunity, NewRole } from '../types/api'
import { ID, Member } from '../types/models'

export const queuePort = 4799

export enum QueueAction {
  join_alliance,
  leave_alliance,
  assign_task,

  join_community,
  leave_community,
  leave_all_communities,
  change_role,
}

export type QueueEvent = (
  [QueueAction.join_alliance, InvitationParticipants] |
  [QueueAction.leave_alliance, InvitationParticipants] |
  [QueueAction.assign_task, AssignTask] |

  [QueueAction.join_community, Member] |
  [QueueAction.leave_community, LeaveCommunity] |
  [QueueAction.leave_all_communities, ID] |
  [QueueAction.change_role, NewRole]
)
