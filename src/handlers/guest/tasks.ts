import { ContextCommand, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { menuKeyboard } from '../../helpers/keyboard'
import { includeRoles, resetStep } from '../../helpers/user'
import { Action } from '../../types/actions'
import { Handler } from '../../types/context'
import { CommunityType } from '../../types/models'
import { TaskData } from '../member/task/common-individual-single'

export const tasks: Handler<Action.tasks, ContextCommand> = async ctx => {
  await resetStep(ctx)

  if (!ctx.user.memberships.length) {
    await ctx.reply(
      'Чтобы получать задания от ваших лидеров, вам нужно вступить в объединение',
      menuKeyboard({
        ['вступить']: Action.join_community
      })
    )
    return
  }

  const tasks = await ctx.api.task.activeList(
    ctx.user.memberships
      .filter(c => c.type === CommunityType.union)
      .map(c => ({
        community_id: c.id,
        roles: includeRoles[c.role],
      })
    )
  )

  if (!tasks.length) {
    await ctx.reply('Доступных заданий нет')
    return
  }

  await ctx.reply('Доступные задания', inlineKeyboard(
    tasks.map(task => ([{
      text: task.title,
      callback_data: formatButtonData<TaskData>(Action.task_info, {
        task_id: task.id,
        community_id: task.community_id,
      }),
    }]))
  ))
}
