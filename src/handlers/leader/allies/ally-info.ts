import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { replyCommunityInfo } from '../../../helpers/reply/community-info'
import { MenuCommunityData } from '../../../helpers/reply/menu'
import { auth, forAlliance, resetStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Community, Role } from '../../../types/models'

interface WatchAllyInfoPayload extends MenuCommunityData {
  ally_id: Community['id']
}

export const beforeSelectAlly: (
  Handler<Action.select_ally, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = forAlliance(auth(ctx, Role.leader))
  const alliance = await ctx.api.community.findById(communityInfo.id)
  const allies = alliance.allies

  if(allies.length === 0) {
    await ctx.reply('В альянсе больше нет сообществ')
    return
  }

  await ctx.reply(
    'Кого показать?',
    inlineKeyboard([
      [{
        text: '📙 все сообщества',
        callback_data: formatButtonData<MenuCommunityData>(
          Action.allies_stats,
          { community_id: communityInfo.id }
        )
      }],
      ...allies.map(ally => ([{
        text: ally.name,
        callback_data: formatButtonData<WatchAllyInfoPayload>(
          Action.ally_info,
          { ally_id: ally.id, community_id: communityInfo.id }
        )
      }]))
    ])
  )
  await resetStep(ctx)
}

export const afterSelectAlly: (
  Handler<Action.ally_info, ContextButton<WatchAllyInfoPayload>>
) = async ctx => {
  forAlliance(auth(ctx, Role.leader))

  const ally = await ctx.api.community.findById(ctx.data.ally_id)
  
  await replyCommunityInfo(ctx, ally)
  await resetStep(ctx)
}
