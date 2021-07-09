import { ContextButton } from '@jace1995/telegram-handler'
import { auth } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Context, Handler } from '../../../types/context'
import { Role } from '../../../types/models'
import { TaskData } from '../../member/task/common-individual-single'
import { updateTaskMessage } from '../../member/task/common-individual-single/update-message'

const toogleTaskClosed = async (
  ctx: Context<unknown, ContextButton<TaskData>>,
  closed: boolean,
) => {
  auth(ctx, Role.leader)

  await ctx.api.task.changeClosed({
    taskId: ctx.data.task_id,
    communityId: ctx.data.community_id,
    closed,
  })

  await updateTaskMessage(ctx)
}

export const closeTask: (
  Handler<Action.close_task, ContextButton<TaskData>>
) = async ctx => {
  await toogleTaskClosed(ctx, true)
}

export const openTask: (
  Handler<Action.open_task, ContextButton<TaskData>>
) = async ctx => {
  await toogleTaskClosed(ctx, false)
}
