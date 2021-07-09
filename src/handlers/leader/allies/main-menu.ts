import { ContextButton } from '@jace1995/telegram-handler'
import { menuKeyboard } from '../../../helpers/keyboard'
import { MenuCommunityData } from '../../../helpers/reply/menu'
import { auth, forAlliance, resetStep } from '../../../helpers/user'

import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'

export const beforeSelectOption: (
  Handler<Action.allies_list, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = forAlliance(auth(ctx, Role.leader))

  const alliance = await ctx.api.community.findById(ctx.data.community_id)
  await ctx.reply(
    (
      alliance.allies.length ?
        'Сообществ в альянсе: ' + alliance.allies.length :
        'В альянсе нет сообществ'
    ),
    menuKeyboard<MenuCommunityData>(
      {
        ['добавить']: Action.add_ally,
        ['отменить приглашение']: Action.allies_cancel_invite,
        ...(alliance.allies.length ? {
          ['исключить']: Action.remove_ally,
          ['посмотреть']: Action.select_ally,
        }: {})
      },
      { community_id: communityInfo.id }
    )
  )
  await resetStep(ctx)
}
