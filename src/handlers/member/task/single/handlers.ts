import { ContextButton } from '@jace1995/telegram-handler'
import { menuKeyboard, taskInfoButton } from '../../../../helpers/keyboard'
import { replyAlert } from '../../../../helpers/reply/alert'
import { Action } from '../../../../types/actions'
import { Handler } from '../../../../types/context'
import { TaskProgress, TaskQueue, TaskType } from '../../../../types/models'
import { authAndHandleChangeProgress, TaskData } from '../common-individual-single'
import { authForTask } from '../common-individual-single/auth'

export const cancel: (
  Handler<Action.single_task_cancel, ContextButton<TaskData>>
) = async (ctx) => {
  const task = await authAndHandleChangeProgress(ctx, {
    type: TaskType.single,
    progress: undefined,
  })

  // разослать уведомления тем кто в очереди
  if (task.wait && task.doing === task.required - 1) {
    const participants = await ctx.api.task.participantsWait(task.id)
    await replyAlert(
      ctx,
      participants,
      (
        `Нужна поддержка! Участник ${ctx.user.id} отменил участие ` +
        `в задании: ${task.title}`
      ),
      taskInfoButton(ctx.data)
    )
  }
}

export const wait: (
  Handler<Action.single_task_wait, ContextButton<TaskData>>
) = async (ctx) => {
  await authAndHandleChangeProgress(ctx, {
    type: TaskType.single,
    progress: TaskQueue.wait,
  })
}

export const doing: (
  Handler<Action.single_task_doing, ContextButton<TaskData>>
) = async (ctx) => {
  const task = await authAndHandleChangeProgress(ctx, {
    type: TaskType.single,
    progress: TaskProgress.doing,
  })

  // разослать уведомления тем кто начинает (если собрано и требуется больше 1)
  if (task.required > 1 && task.doing >= task.required && task.ready !== true) {
    const [participants] = await Promise.all([
      ctx.api.task.participantsDoing(task.id),
      ctx.api.task.setReady(task.id),
    ])

    await replyAlert(
      ctx,
      participants,
      (
        `Пора действовать! Собрано нужное количество участников (${task.doing}) ` +
        `для задания: ${task.title}`
      ),
      taskInfoButton(ctx.data)
    )
  }
}

export const done: (
  Handler<Action.single_task_done, ContextButton<TaskData>>
) = async (ctx) => {
  await authForTask(ctx)
  try {
    await ctx.telegram.editMessageText(
      ctx.user.chat,
      ctx.callbackQuery.message?.message_id,
      ctx.callbackQuery.inline_message_id,
      `Вы действительно выполнили задание? Разовое задание будет закрыто для всех!`,
      menuKeyboard<TaskData>({
        ['подтвердить']: Action.single_task_confirm_done,
        ['отмена']: Action.update_task_message,
      }, ctx.data)
    )
  } catch (e) {
    console.error(e)
  }
}

export const confirmDone: (
  Handler<Action.single_task_confirm_done, ContextButton<TaskData>>
) = async (ctx) => {
  const task = await authAndHandleChangeProgress(ctx, {
    type: TaskType.single,
    progress: TaskProgress.done,
  })

  await ctx.api.task.changeClosed({
    closed: true,
    taskId: task.id,
  })

  // разослать уведомление лидерам и участникам задачи

  const [participantsDoing, participantsLeader] = await Promise.all([
    ctx.api.task.participantsDoing(task.id),
    ctx.api.task.participantsLeader(task.id),
  ])

  const participants = Array.from(new Set([
    ...(participantsDoing ?? []),
    ...(participantsLeader ?? [])
  ]))

  await replyAlert(
    ctx,
    participants,
    `Участник отметил выполнение задания: ${task.title}`,
    taskInfoButton(ctx.data)
  )
}
