import { ContextButton } from '@jace1995/telegram-handler'
import { menuKeyboard } from '../../../helpers/keyboard'

import { MenuCommunityData } from '../../../helpers/reply/menu'

import { auth, resetStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'

export const beforeSelectOption: ( 
  Handler<Action.alliances, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)
  const community = await ctx.api.community.findById(communityInfo.id)

  if (!community.alliances.length) {
    await ctx.reply('Сообщество не состоит в альянсе')
  }
  else {
    await ctx.reply(
      'Сообщество состоит в ' + 
      (community.alliances.length > 1? 'альянсах\n': 'альянсе\n') +
      community.alliances.map(alliance => alliance.name).join('\n')
    )
  }
  
  await ctx.reply(
    `Альянсы сообщества "${communityInfo.name}"`, 
    menuKeyboard<MenuCommunityData>(
      {
        ['вступить в альянс']: Action.alliance_join,
        ['выйти из альянса']: Action.alliance_leave_select_id,
        ['отменить заявку']: Action.alliance_cancel_invite_select,
      },
      { community_id: community.id }
    )
  )
  await resetStep(ctx)
}
