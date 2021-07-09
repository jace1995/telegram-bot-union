import { ContextButton } from '@jace1995/telegram-handler'

import { Role } from '../../types/models'
import { Action } from '../../types/actions'
import { auth, resetStep } from '../../helpers/user'
import { MenuCommunityData } from '../../helpers/reply/menu'
import { Handler } from '../../types/context'
import { confirmButton, menuKeyboard } from '../../helpers/keyboard'
import { closeCommunities } from '../../helpers/close-community'

export const beforeConfirm: (
  Handler<Action.exclude_all, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)

  await ctx.reply(
    'Вы действительно хотите исключить всех участников и тем самым закрыть сообщество? ' +
    'Это действие необратимо!',
    confirmButton<MenuCommunityData>(
      Action.confirm_exclude_all,
      { community_id: communityInfo.id }
    )
  )

  await resetStep(ctx)
}

export const afterConfirm: (
  Handler<Action.confirm_exclude_all, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)
  
  await closeCommunities(ctx, communityInfo.id)
  await resetStep(ctx)
}
