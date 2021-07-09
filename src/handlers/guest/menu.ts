import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { auth, resetStep } from '../../helpers/user'
import { Role } from '../../types/models'
import { menu, MenuCommunityData } from '../../helpers/reply/menu'
import { Action } from '../../types/actions'
import { Handler } from '../../types/context'
import { menuKeyboard } from '../../helpers/keyboard'

export const showMenu: Handler<Action.menu> = async ctx => {
  const memberships = ctx.user.memberships

  if (!memberships.length) {
    await ctx.reply(
      'Вы не состоите в сообществе. Хотите создать новое или вступить в уже существующее?',
      menuKeyboard({
        ['создать']: Action.create_community,
        ['вступить']: Action.join_community,
      })
    )
  }
  else {
    if (memberships.length === 1) {
      const communityInfo = memberships[0]
      await ctx.reply(...menu(communityInfo))
    }
    else {
      await ctx.reply('Выберите сообщество', inlineKeyboard(
        memberships.map(community => ([{
          text: (community.role === Role.leader ? '👑 ' : '') + community.name,
          callback_data: formatButtonData<MenuCommunityData>(
            Action.menu_community_selected,
            { community_id: community.id }
          )
        }]))
      ))
    }
  }
  
  await resetStep(ctx)
}

export const afterCommunitySelected: (
  Handler<Action.menu_community_selected, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.member, ctx.data.community_id)
  await ctx.reply(...menu(communityInfo))
  await resetStep(ctx)
}
