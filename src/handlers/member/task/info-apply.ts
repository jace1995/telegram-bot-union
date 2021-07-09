import { ContextButton } from '@jace1995/telegram-handler'
import { replyTaskInfo } from '../../../helpers/reply/task-info'
import { auth } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'
import { TaskData } from './common-individual-single'

export const infoApply: (
  Handler<Action.task_apply_info, ContextButton<TaskData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.member, ctx.data.community_id)
  const task = await ctx.api.task.findById(ctx.data.task_id)
  await replyTaskInfo(ctx, {...task, ...task.details}, communityInfo, ctx.user.id)
}