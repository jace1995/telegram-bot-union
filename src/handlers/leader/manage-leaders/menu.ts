import { ContextButton } from '@jace1995/telegram-handler'
import { DialogPrevented } from '@jace1995/telegram-handler/build/start/error-handler'
import { menuKeyboard } from '../../../helpers/keyboard'
import { MenuCommunityData } from '../../../helpers/reply/menu'
import { auth, forAlliance, resetStep } from '../../../helpers/user'

import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { CommunityType, Role } from '../../../types/models'

export const menu: (
  Handler<Action.leaders_menu, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = forAlliance(auth(ctx, Role.leader))
  const alliance = await ctx.api.community.findById(communityInfo.id)
  const leaders = alliance.users.leaders

  if (alliance.type !== CommunityType.alliance) {
    throw new DialogPrevented()
  }

  await ctx.reply(
    'Лидеров в альянсе: ' + leaders.length,
    menuKeyboard({
      ['добавить']: Action.add_leader,
      ['исключить']: Action.remove_leader,
    }, { community_id: communityInfo.id }),
  )
  
  await resetStep(ctx)
}
