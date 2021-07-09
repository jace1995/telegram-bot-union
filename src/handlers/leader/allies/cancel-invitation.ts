import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { MenuCommunityData } from '../../../helpers/reply/menu'
import { auth, forAlliance, resetStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'

interface CancelInviteProps {
  invite: number[]
}

export const beforeSelectInvite: (
  Handler<Action.allies_cancel_invite, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = forAlliance(auth(ctx, Role.leader))
  const invitations = await ctx.api.alliance.invitations(communityInfo.id)

  if (invitations.length === 0) {
    await ctx.reply('У вас нет приглашений')
    return
  }

  await ctx.reply(
    'Идентификаторы приглашённых сообществ',
    inlineKeyboard(
      invitations.map(invite => (
        [
          {
            text: String(invite.ally_id),
            callback_data: formatButtonData<CancelInviteProps>(
              Action.allies_cancel_invite_save,
              { invite: [invite.alliance_id, invite.ally_id] }
            )
          }
        ]
      ))
    )
  )

  await resetStep(ctx)
}

export const afterSelectInvite: (
  Handler<Action.allies_cancel_invite_save, ContextButton<CancelInviteProps>>
) = async ctx => {
  const [alliance_id, ally_id] = ctx.data.invite
  
  forAlliance(auth(ctx, Role.leader, alliance_id))

  await ctx.api.alliance.cancelInvite({ allianceId: alliance_id, allyId: ally_id })
  await ctx.reply('Приглашение отменено')
  await resetStep(ctx)
}
