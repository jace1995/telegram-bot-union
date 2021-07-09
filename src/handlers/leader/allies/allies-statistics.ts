import { ContextButton } from '@jace1995/telegram-handler'
import { array2excel } from '../../../helpers/array2excel'
import { auth, forAlliance } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'
import { TaskData } from '../../member/task/common-individual-single'

export const alliesStatistics: (
  Handler<Action.allies_stats, ContextButton<TaskData>>
) = async ctx => {
  const communityInfo = forAlliance(auth(ctx, Role.leader))

  await ctx.reply('Обработка статистики...')

  const excel = await ctx.api.community.statistics({
    communityId: communityInfo.id,
    communityName: communityInfo.name,
  })

  if (!excel) {
    throw new Error()
  }

  await ctx.replyWithDocument({
    filename: excel.filename,
    source: await array2excel(excel.values)
  })
}
