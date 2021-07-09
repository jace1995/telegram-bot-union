import { MenuCommunityData, menuData } from '../../../helpers/reply/menu'
import { ContextButton } from '@jace1995/telegram-handler'
import { menuKeyboard } from '../../../helpers/keyboard'
import { Action } from '../../../types/actions'
import { Role } from '../../../types/models'
import { auth, resetStep } from '../../../helpers/user'
import { Handler } from '../../../types/context'

const menu = {
  ['название']: Action.edit_community_name,
  ['описание']: Action.edit_community_description,
  ['изображение']: Action.edit_community_image,
}

export const communityMenu: (
  Handler<Action.edit_community, ContextButton<MenuCommunityData>>
) = async ctx => {
  const community = auth(ctx, Role.leader)

  await ctx.reply(
    'Что изменить?',
    menuKeyboard<MenuCommunityData>(
      menu,
      menuData(community.id),
    )
  )
  await resetStep(ctx)
}
