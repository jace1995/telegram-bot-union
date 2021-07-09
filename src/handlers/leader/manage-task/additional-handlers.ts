import { ContextButton } from '@jace1995/telegram-handler'
import { taskInfoButton } from '../../../helpers/keyboard'
import { replyAlert } from '../../../helpers/reply/alert'
import { auth, resetStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'
import { TaskData } from '../../member/task/common-individual-single'

export const callWaitingMembers: (
  Handler<Action.call_waiting_members, ContextButton<TaskData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)

  const task = await ctx.api.task.info({
    communityId: ctx.data.community_id,
    taskId: ctx.data.task_id,
    userId: ctx.user.id,
  })
  
  const participants = await ctx.api.task.participantsWait(ctx.data.task_id)
  
  await replyAlert(
    ctx,
    participants,
    `Лидер сообщества ${communityInfo.name} просит присоединиться к заданию ${task.title}`,
    taskInfoButton(ctx.data)
  )

  await ctx.reply('Уведомление отправлено')
  await resetStep(ctx)
}

export const remindParticipationConfirm: (
  Handler<Action.remind_confirm, ContextButton<TaskData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)

  const task = await ctx.api.task.info({
    communityId: ctx.data.community_id,
    taskId: ctx.data.task_id,
    userId: ctx.user.id,
  })
  
  const participants = await ctx.api.task.participantsDoing(ctx.data.task_id)
  
  await replyAlert(
    ctx,
    participants,
    (
      `Лидер сообщества ${communityInfo.name} напоминает ` +
      `подтвердить или отменить участие в задании ${task.title}`
    ),
    taskInfoButton(ctx.data)
  )

  await ctx.reply('Уведомление отправлено')
  await resetStep(ctx)
}
