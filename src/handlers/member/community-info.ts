import { ContextButton } from '@jace1995/telegram-handler'
import { DialogPrevented } from '@jace1995/telegram-handler/build/start/error-handler'
import { Action } from '../../types/actions'
import { replyCommunityInfo } from '../../helpers/reply/community-info'
import { auth, resetStep } from '../../helpers/user'
import { CommunityInfo, Role } from '../../types/models'
import { Handler } from '../../types/context'
import { CommunityType } from '../../types/models'
import { menuKeyboard } from '../../helpers/keyboard'
import { MenuCommunityData } from '../../helpers/reply/menu'

const communityInfoMenu = (communityInfo: CommunityInfo, data: MenuCommunityData) => {
  const buttons: Record<string, Action> = {}

  if (communityInfo.role === Role.leader) {
    buttons['редактировать описание'] = Action.edit_community

    if (communityInfo.type === CommunityType.union) {
      buttons['локации'] = Action.locations_list
    }

    buttons['альянсы'] = Action.alliances
  }

  buttons['выйти из сообщества'] = Action.leave_community

  return menuKeyboard<MenuCommunityData>(buttons, data)
}

export const communityInfo: (
  Handler<Action.community_info, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.member)

  if (communityInfo.type === CommunityType.alliance && communityInfo.role !== Role.leader) {
    throw new DialogPrevented()
  }

  const community = await ctx.api.community.findById(communityInfo.id)

  await replyCommunityInfo(ctx, community)

  await ctx.reply(
    (
      communityInfo.role === Role.leader ?
        'Управление сообществом' :
        'Вы можете выйти, чтобы не получать задания сообщества'
    ),
    communityInfoMenu(communityInfo, { community_id: community.id })
  )

  await resetStep(ctx)
}
