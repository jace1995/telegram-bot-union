import { ContextButton } from '@jace1995/telegram-handler'

import { Community, CommunityType, Role } from '../../types/models'
import { Action } from '../../types/actions'
import { auth, resetStep } from '../../helpers/user'
import { Menu, MenuCommunityData } from '../../helpers/reply/menu'
import { Handler } from '../../types/context'
import { menuKeyboard } from '../../helpers/keyboard'

const unionMembersMenu = (community: Community): Menu => {
  const users = community.users

  return [
    (
      'Проверенных: ' + users.verifieds.length + '\n' +
      'Активистов: ' + users.activists.length + '\n' +
      'Лидеров: ' + users.leaders.length
    ),
    menuKeyboard<MenuCommunityData>({
      ['управление ролями']: Action.manage_role,
      ['сбросить роли']: Action.reset_roles,
      ['исключить всех']: Action.exclude_all,
    }, { community_id: community.id }),
  ]
}

const allianceMembersMenu = (community: Community): Menu => {
  return [
    (
      'Лидеров: ' + community.users.leaders.length + '\n' +
      'Сообществ: ' + community.allies.length
    ),
    menuKeyboard<MenuCommunityData>({
      ['лидеры']: Action.leaders_menu,
      ['сообщества']: Action.allies_list,
      ['исключить всех']: Action.exclude_all,
    }, { community_id: community.id }),
  ]
}

const selectMembersMenu = (community: Community): Menu => {
  switch (community.type) {
    case CommunityType.union:
      return unionMembersMenu(community)

    case CommunityType.alliance:
      return allianceMembersMenu(community)
  }
}

export const membersMenu: (
  Handler<Action.members, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)

  const community = await ctx.api.community.findById(communityInfo.id)

  const [text, keyboard] = selectMembersMenu(community)

  await ctx.reply(
    `"${community.name}"\n` + text,
    keyboard
  )

  await resetStep(ctx)
}
