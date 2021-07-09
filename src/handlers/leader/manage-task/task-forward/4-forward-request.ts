import { replyAlert } from '../../../../helpers/reply/alert'
import { resetStep } from '../../../../helpers/user'
import { Context } from '../../../../types/context'
import { replyAlertLeaders } from './5-reply-alert'
import { ForwardMethod, ForwardTaskPayload } from './types'

export const forwardRequest = async (
  ctx: Context<ForwardTaskPayload>,
  forwardMethod: ForwardMethod
) => {
  const {
    selection,
    taskData,
    community,
    leadersIds,
  } = ctx.user.payload

  const recepientsId = Object.keys(selection).map(Number).filter(id => selection[id].selected)

  const [task, recipients] = await Promise.all([
    ctx.api.task.findById(taskData.task_id),
    ctx.api.community.findByIds(recepientsId),
  ])

  await Promise.all([
    ctx.api.task.requestAssign({
      taskId: task.id,
      senderId: community.id, 
      recipientsIds: recepientsId,
    }),

    replyAlertLeaders(
      ctx,
      recipients,
      task,
      community,
      forwardMethod,
    ),
  ])

  await replyAlert(
    ctx,
    leadersIds,
    (
      `Задание "${task.title}" принято на рассмотрение сообществами: \n` +
      recipients.map(recepient => `${recepient.id}: ${recepient.name}`).join('\n')
    )
  )

  await resetStep(ctx)
}
