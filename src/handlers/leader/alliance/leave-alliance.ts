import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { replyAlert } from '../../../helpers/reply/alert'
import { MenuCommunityData } from '../../../helpers/reply/menu'
import { auth, resetStep, setStep } from '../../../helpers/user'

import { Action } from '../../../types/actions'
import { InvitationParticipants } from '../../../types/api'
import { Handler } from '../../../types/context'
import { Community, Role } from '../../../types/models'

interface LeaveAllianceData extends InvitationParticipants {}

export interface LeaveAlliancePayload {
  communityId: Community['id']
  commuityLeadersIds: number[]
}

export const beforeSelectAllianceToLeave: (
  Handler<Action.alliance_leave_select_id, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)

  const community = await ctx.api.community.findById(communityInfo.id)

  if(community.alliances.length === 0) {
    await ctx.reply('Вы не состоит ни в одном альянсе')
    return
  }
  await ctx.reply(
    'Список альянсов',
    inlineKeyboard(
      community.alliances.map(alliance => (
        [
          {
            text: alliance.name,
            callback_data: formatButtonData<LeaveAllianceData>(
              Action.alliance_leave,
              { allianceId: alliance.id, allyId: community.id }
            )
          }
        ]
      ))
    ))

    await setStep(ctx, Action.alliance_leave, {
      communityId: community.id,
      commuityLeadersIds: community.users.leaders
    })
}

export const afterSelectAllianceToLeave: (
  Handler<Action.alliance_leave, ContextButton<LeaveAllianceData>>
) = async ctx => {
  const { communityId, commuityLeadersIds } = ctx.user.payload

  const communityInfo = auth(ctx, Role.leader, communityId)

  const alliance = await ctx.api.community.findById(ctx.data.allianceId)

  if(!alliance.allies.some(ally => ally.id === ctx.data.allyId)) {
    await ctx.reply('Сообщество не состоит в этом альянсе')
    return
  }

  await ctx.api.alliance.leave(ctx.data)
  await ctx.api.alliance.sendInvite({
    ally_id: ctx.data.allyId,
    alliance_id: ctx.data.allianceId,
    inviter_id: ctx.data.allianceId,
  })

  const allLeadersChats = [...alliance.users.leaders, ...commuityLeadersIds]

  await replyAlert(
    ctx,
    allLeadersChats,
    `Сообщество ${communityInfo.name} вышло из альянса ${alliance.name}`
  )
  
  await resetStep(ctx)
}
