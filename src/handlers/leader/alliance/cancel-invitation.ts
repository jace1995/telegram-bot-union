import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { MenuCommunityData } from '../../../helpers/reply/menu'
import { auth, resetStep } from '../../../helpers/user'

import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'

interface CancelInviteProps {
  invite: number[]
}

export const beforeSelectInvite: (
  Handler<Action.alliance_cancel_invite_select, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)
  const invitations = await ctx.api.alliance.invitations(communityInfo.id)
  
  if(!invitations.length) {
    await ctx.reply('У вас нет заявок')
    return
  }
  
  await ctx.reply(
    'Список заявок',
    inlineKeyboard(
      invitations.map(invitation => ([{
        text: String(invitation.alliance_id),
        callback_data: formatButtonData<CancelInviteProps>(
          Action.alliance_cancel_invitation,
          { invite: [invitation.alliance_id, invitation.ally_id] }
        )
      }]))
    )
  )

  await resetStep(ctx)
}

export const afterSelectInvite: (
  Handler<Action.alliance_cancel_invitation, ContextButton<CancelInviteProps>>
) = async ctx => {
  const [allianceId, allyId] = ctx.data.invite
  
  auth(ctx, Role.leader, allyId)
  
  await ctx.api.alliance.cancelInvite({ allianceId, allyId })
  await ctx.reply('Заявка отменена')
  await resetStep(ctx)
}
