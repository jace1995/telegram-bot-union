import { ContextButton } from '@jace1995/telegram-handler'

import { Role } from '../../types/models'
import { Action } from '../../types/actions'
import { auth, resetStep } from '../../helpers/user'
import { MenuCommunityData } from '../../helpers/reply/menu'
import { Handler } from '../../types/context'
import { updateRole } from '../activist/update-role'
import { confirmButton } from '../../helpers/keyboard'

export const beforeConfirm: (
  Handler<Action.reset_roles, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)

  await ctx.reply(
    `Всем участникам сообщества "${communityInfo.name}" в роли "проверенный" и "активист" ` +
    `будет возвращена базовая роль "участник". Вы уверены?`,
    confirmButton<MenuCommunityData>(
      Action.confirm_reset_roles,
      { community_id: communityInfo.id }
    )
  )

  await resetStep(ctx)
}

export const afterConfirm: (
  Handler<Action.confirm_reset_roles, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)

  const community = await ctx.api.community.findById(communityInfo.id)

  const users = community.users

  const membersIdsForResetRole = [...users.activists, ...users.verifieds]

  await updateRole(ctx, membersIdsForResetRole, communityInfo, Role.member)
  await ctx.reply('Роли сброшены')
  await resetStep(ctx)
}
