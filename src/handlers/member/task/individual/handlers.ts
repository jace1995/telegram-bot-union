import { ContextButton } from '@jace1995/telegram-handler'
import { taskInfoButton } from '../../../../helpers/keyboard'
import { replyAlert } from '../../../../helpers/reply/alert'
import { Action } from '../../../../types/actions'
import { Handler } from '../../../../types/context'
import { TaskProgress, TaskType } from '../../../../types/models'
import { authAndHandleChangeProgress, TaskData } from '../common-individual-single'

export const cancel: (
  Handler<Action.individual_task_cancel, ContextButton<TaskData>>
) = async (ctx) => {
  await authAndHandleChangeProgress(ctx, {
    type: TaskType.single,
    progress: undefined,
  })
}

export const doing: (
  Handler<Action.individual_task_doing, ContextButton<TaskData>>
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
  Handler<Action.individual_task_done, ContextButton<TaskData>>
) = async (ctx) => {
  await authAndHandleChangeProgress(ctx, {
    type: TaskType.single,
    progress: TaskProgress.done,
  })
}
