import { replyTaskInfo } from '../../../../../helpers/reply/task-info'
import { AuthPayload, resetStep } from '../../../../../helpers/user'
import { filterMembersByAvailableRoles } from '../../../../../helpers/utils'
import { Context } from '../../../../../types/context'
import { Community, CommunityInfo, Task } from '../../../../../types/models'

import { ForwardMethod } from '../../task-forward/types'

export interface ApplyAcceptTaskPayload extends AuthPayload {
  forwardMethod: ForwardMethod
  senderId: number
  taskId: Task['id']
}

const applyForwardMethod = async (
  ctx: Context,
  forwardMethod: ForwardMethod,
  task: Task,
  communityId: Community['id']
): Promise<Task['id']> => {
  switch(forwardMethod) {
    case (ForwardMethod.original): {
      await ctx.api.task.assign({
        taskId: task.id,
        recipientsIds: [communityId],
      })
      
      return task.id
    }
    case (ForwardMethod.copy): {
      const newTaskId = await ctx.api.task.create(task)
      
      await ctx.api.task.assign({
        taskId: newTaskId,
        recipientsIds: [communityId],
      })
      
      return newTaskId
    }
  }
}

export const applyAcceptTask = async (
  ctx: Context<ApplyAcceptTaskPayload>,
  communityInfo: CommunityInfo,
  task: Task,
) => {
  const {
    forwardMethod,
    senderId,
  } = ctx.user.payload

  const community = await ctx.api.community.findById(communityInfo.id)

  await ctx.api.task.cancelRequestAssign({
    taskId: task.id,
    senderId,
    recipientId: community.id,
  })

  const finalTaskId = await applyForwardMethod(ctx, forwardMethod, task, community.id)

  const taskInfo = await ctx.api.task.info({
    taskId: finalTaskId,
    communityId: community.id,
    userId: ctx.user.id,
  })

  const recipients = filterMembersByAvailableRoles(community.users, task.role)

  await replyTaskInfo(ctx, taskInfo, communityInfo, recipients)
  await resetStep(ctx)
}
