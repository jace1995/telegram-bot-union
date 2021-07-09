import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { DialogPrevented } from '@jace1995/telegram-handler/build/start/error-handler'
import { replyTaskById } from '../../../../../helpers/reply/task-info'
import { auth, includeRoles, resetStep, setStep } from '../../../../../helpers/user'
import { filterMembersByAvailableRoles } from '../../../../../helpers/utils'

import { Action } from '../../../../../types/actions'
import { Handler } from '../../../../../types/context'
import { Community, Role, Task, TaskInfo } from '../../../../../types/models'

import { LeadersAlertMenu } from './accept-task'

export interface AttachTaskPayload {
  taskInfo: Task
  community: Community
  senderId: Community['id']
}

export const attachTaskBeforeSelect: (
  Handler<Action.attach_task_select, ContextButton<LeadersAlertMenu>>
) = async ctx => {
  const [ taskId, senderId, communityId] = ctx.data
  const communityInfo = auth(ctx, Role.leader, communityId)

  const [community, task] = await Promise.all([
    ctx.api.community.findById(communityInfo.id),
    ctx.api.task.findById(taskId),
  ])

  if(!task) {
    throw new DialogPrevented()
  }

  const tasks = await (await ctx.api.task.list(community.id, includeRoles[communityInfo.role])).filter(
    task => task.type === task.type
  )

  const recipients = filterMembersByAvailableRoles(community.users, task.role)

  if(tasks.length === 0) {
    await ctx.reply('Невозможно присоединить');
    return
  }

  await ctx.reply(
    'Выберите задачу, откуда нужно перенести статистику выполнения',
    inlineKeyboard(tasks.map(task => ([
      {
        text: task.title,
        callback_data: formatButtonData(
          Action.attach_task,
          task.id
        )
      }
    ])))
  )

  await setStep(ctx, Action.attach_task, {
    taskInfo: task,
    community,
    senderId
  })
}

export const attachTaskAfterSelect: (
  Handler<Action.attach_task, ContextButton<Task['id']>>
) = async ctx => {
  const {taskInfo, community, senderId} = ctx.user.payload
  const selectedTaskid = ctx.data

  const communityInfo = auth(ctx, Role.leader, community.id)

  // !!! перенос статистики
  // await ctx.api.task.assign({
  //   taskId: selectedTaskid,
  //   recipientsIds: [community.id],
  // })
  // await ctx.api.task.cancelRequestAssign({taskId: taskInfo.id, recipientId: community.id, senderId})
  // await ctx.api.task.changeClosed({closed, taskId: selectedTaskid, communityId: communityInfo.id})

  await ctx.reply(`Присоединено задание на основе: "${taskInfo.title}"`)
  await replyTaskById(ctx, selectedTaskid, communityInfo)

  await resetStep(ctx)
}
