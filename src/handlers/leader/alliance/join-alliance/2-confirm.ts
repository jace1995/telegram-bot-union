import { ContextButton } from '@jace1995/telegram-handler'
import { Action } from '../../../../types/actions'
import { InvitationParticipants } from '../../../../types/api'
import { Context, Handler } from '../../../../types/context'
import { confirmButton } from '../../../../helpers/keyboard'
import { replyAlert } from '../../../../helpers/reply/alert'
import { Community, Role } from '../../../../types/models'
import { auth, resetStep } from '../../../../helpers/user'

export interface JoinAllianceProps {
  communityId: Community['id']
  alliance: Community
}

export const beforeConfirmJoinAlliance = async (ctx: Context<JoinAllianceProps>) => {
  await ctx.reply('Вступить в альянс?', confirmButton(Action.alliance_join_confirm))
  await ctx.api.user.setStep(ctx.user.id, Action.alliance_join_confirm, ctx.user.payload)
}

export const afterConfirmJoinAlliance: (
  Handler<Action.alliance_join_confirm, ContextButton>
) = async ctx => {
  const { communityId, alliance } = ctx.user.payload
  
  const communityInfo = auth(ctx, Role.leader, communityId)

  const community = await ctx.api.community.findById(communityInfo.id)

  const invite: InvitationParticipants = {
    allianceId: alliance.id,
    allyId: community.id
  }

  const inviterId = await ctx.api.alliance.getInviter(invite)

  const leaders = community.users.leaders
  
  if (inviterId === null) {
    await ctx.api.alliance.sendInvite({
      ally_id: invite.allyId,
      alliance_id: invite.allianceId,
      inviter_id: invite.allyId
    })
    await replyAlert(
      ctx,
      leaders,
      'Сообщество ' + community.name +
      ' отправило заявку в альянс ' + alliance.name
    )
  }
  else {
    const allLeaders = [...alliance.users.leaders, ...leaders]

    await ctx.api.alliance.join(invite)
    await ctx.api.alliance.cancelInvite(invite)

    await replyAlert(
      ctx,
      allLeaders,
      (
        `Сообщество ${community.name} ` +
        `присоединилось к альянсу ${alliance.name}`
      )
    )
  }

  await resetStep(ctx)
}
