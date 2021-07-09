import { taskActionsMenu } from '../../../../helpers/reply/task-info'
import { updateMessage } from '../../../../helpers/reply/update-message'
import { auth } from '../../../../helpers/user'
import { Role } from '../../../../types/models'
import { ContextTask } from './auth'

export const updateTaskMessage = async (ctx: ContextTask) => {
  const communityInfo = auth(ctx, Role.member, ctx.data.community_id)

  const taskInfo = await ctx.api.task.info({
    taskId: ctx.data.task_id,
    communityId: ctx.data.community_id,
    userId: ctx.user.id,
  })

  if (!taskInfo) {
    throw new Error('task not found')
  }

  const menu = await taskActionsMenu(
    taskInfo,
    ctx.data,
    ctx.user.id,
    communityInfo.role,
    communityInfo.type,
  )

  await updateMessage(ctx, menu)

  return taskInfo
}
