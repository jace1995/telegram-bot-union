import { ContextButton } from '@jace1995/telegram-handler'

import { auth, resetPayload } from '../../../../../helpers/user'
import { Action } from '../../../../../types/actions'
import { Handler } from '../../../../../types/context'
import { Community, CommunityType, Role, Task, TaskType } from '../../../../../types/models'
import { beforeSelectLocation } from './2-select-locations'

import { ForwardMethod } from '../../task-forward/types'
import { applyAcceptTask, ApplyAcceptTaskPayload } from './3-accept-task'

export type LeadersAlertMenu = [ Task['id'], Community['id'], Community['id'], ForwardMethod ]

export const acceptTask: (
  Handler<Action.accept_task, ContextButton<LeadersAlertMenu>>
) = async ctx => {
  const [taskId, senderId, communityId, forwardMethod] = ctx.data

  const communityInfo = auth(ctx, Role.leader, communityId)

  const task = await ctx.api.task.findById(taskId)

  const payload: ApplyAcceptTaskPayload = {
    community: communityInfo,
    forwardMethod,
    senderId,
    taskId: task.id,
  }

  if (communityInfo.type === CommunityType.union && task.type === TaskType.location) {
    beforeSelectLocation(resetPayload(ctx, payload))
  } else {
    applyAcceptTask(resetPayload(ctx, payload), communityInfo, task)
  }
}
