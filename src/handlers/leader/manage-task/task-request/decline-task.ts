import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { DialogPrevented } from '@jace1995/telegram-handler/build/start/error-handler'
import { taskInfoButton } from '../../../../helpers/keyboard'
import { replyAlert } from '../../../../helpers/reply/alert'
import { auth, resetStep } from '../../../../helpers/user'
import { filterMembersByAvailableRoles } from '../../../../helpers/utils'

import { Action } from '../../../../types/actions'
import { Handler } from '../../../../types/context'
import { Community, Role } from '../../../../types/models'
import { TaskData } from '../../../member/task/common-individual-single'

import { LeadersAlertMenu } from './accept-task/1-load-task'

export interface AttachTaskPayload {
  recipient: Community
}

export const declineTask: (
  Handler<Action.decline_task, ContextButton<LeadersAlertMenu>>
) = async ctx => {
  const [taskId, senderId, communityId, forwardMethod] = ctx.data
  const communityInfo = auth(ctx, Role.leader, communityId)

  const [community, task] = await Promise.all([
    ctx.api.community.findById(communityInfo.id),
    ctx.api.task.findById(taskId),
  ])
  
  const recipients = filterMembersByAvailableRoles(community.users, task.role)

  await ctx.api.task.cancelRequestAssign({taskId, senderId, recipientId: community.id})

  await replyAlert(
    ctx,
    recipients,
    (
      `Сообщество "${community.name}" отклонило задачу: "${task.title}"`
    ),
    inlineKeyboard(
      [
        {
          text: 'подробнее',
          callback_data: formatButtonData<TaskData>(
            Action.task_apply_info,
            {task_id: taskId, community_id: communityId}
          )
        }
      ]
    ),
  )

  await resetStep(ctx)
}
