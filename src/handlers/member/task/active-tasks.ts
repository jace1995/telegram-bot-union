import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { replyFirstInstruction } from '../../../helpers/reply/first-instruction'
import { MenuCommunityData } from '../../../helpers/reply/menu'
import { replyTaskById } from '../../../helpers/reply/task-info'

import { auth, includeRoles, resetStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role, Task } from '../../../types/models'
import { TaskData } from './common-individual-single'

export interface ActiveTasksData extends MenuCommunityData {
  task_id?: Task['id']
}

export const activeTasks: (
  Handler<Action.active_tasks, ContextButton<ActiveTasksData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.member)

  await replyFirstInstruction(ctx, Action.active_tasks)

  const tasksInfo = await ctx.api.task.list(
    communityInfo.id,
    includeRoles[communityInfo.role]
  )

  if (tasksInfo.length === 1 || ctx.data.task_id) {
    const taskId = ctx.data.task_id ?? tasksInfo[0].id
    await replyTaskById(ctx, taskId, communityInfo)
    return
  }
  else if (!tasksInfo.length) {
    await ctx.reply('Активных заданий нет')
    return
  }
  else {
    await ctx.reply('Активные задания', inlineKeyboard(
      tasksInfo.map(task => ([{
        text: task.title,
        callback_data: formatButtonData<TaskData>(
          Action.active_tasks,
          {
            community_id: ctx.data.community_id,
            task_id: task.id
          }
        )
      }]))
    ))
  }
  
  await resetStep(ctx)
}
