import { ContextButton } from '@jace1995/telegram-handler'
import { array2excel } from '../../../helpers/array2excel'
import { auth, forAlliance } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'
import { TaskData } from '../../member/task/common-individual-single'

export const taskStatistics: (
  Handler<Action.task_stats, ContextButton<TaskData>>
) = async ctx => {
  forAlliance(auth(ctx, Role.leader))

  await ctx.reply('Обработка статистики...')

  const excel = await ctx.api.task.statistics({
    taskId: ctx.data.task_id,
    communityId: ctx.data.community_id,
  })

  if (!excel) {
    throw new Error()
  }

  await ctx.replyWithDocument({
    filename: excel.filename,
    source: await array2excel(excel.values)
  })
}
