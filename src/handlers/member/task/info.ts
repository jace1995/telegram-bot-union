import { ContextButton } from '@jace1995/telegram-handler'
import { replyTaskById } from '../../../helpers/reply/task-info'
import { auth } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'
import { authForTask, TaskData } from './common-individual-single/auth'

export const info: (
  Handler<Action.task_info, ContextButton<TaskData>>
) = async ctx => {
  const authInfo = await authForTask(ctx, true)
  await replyTaskById(ctx, ctx.data.task_id, authInfo.community)
}
