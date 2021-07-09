import { ContextButton } from '@jace1995/telegram-handler'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { TaskData } from './common-individual-single'
import { authForTask } from './common-individual-single/auth'
import { updateTaskMessage } from './common-individual-single/update-message'

export const beforeUpdateTaskInfo: (
  Handler<Action.update_task_message, ContextButton<TaskData>>
) = async ctx => {
  await authForTask(ctx)
  await updateTaskMessage(ctx)
}
