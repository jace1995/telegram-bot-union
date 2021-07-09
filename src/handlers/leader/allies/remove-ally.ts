import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { replyAlert } from '../../../helpers/reply/alert'
import { MenuCommunityData } from '../../../helpers/reply/menu'
import { auth, forAlliance, resetStep, setStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Community, Role } from '../../../types/models'

interface RemoveAllyPayload {
  allyId: Community['id']
}

export const beforeSelectAllyId: (
  Handler<Action.remove_ally, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = forAlliance(auth(ctx, Role.leader))
  const alliance = await ctx.api.community.findById(communityInfo.id)
  await ctx.reply(
    'Кого исключить?',
    inlineKeyboard(
      alliance.allies.map(ally => (
        [
          {
            text: ally.name,
            callback_data: formatButtonData<RemoveAllyPayload>(
              Action.remove_ally_save,
              {allyId: ally.id}
            )
          }
        ]
      ))
    )
  )

  await setStep(ctx, Action.remove_ally_save, { community: communityInfo })
}

export const afterSelectAllyId: (
  Handler<Action.remove_ally_save, ContextButton<RemoveAllyPayload>>
) = async ctx => {
  forAlliance(auth(ctx, Role.leader))

  const allyId = ctx.data.allyId
  const alliance = await ctx.api.community.findById(ctx.user.payload.community.id)
  const ally = await ctx.api.community.findById(allyId)

  await ctx.api.alliance.leave({allianceId: alliance.id, allyId: allyId})
  await ctx.api.alliance.sendInvite({alliance_id: alliance.id, ally_id: allyId, inviter_id: allyId})

  await replyAlert(
    ctx,
    [...ally.users.leaders, ...alliance.users.leaders],
    `Альянс ${alliance.name} исключил сообщество ${ally.name} (${ally.id})`
  )
  await resetStep(ctx)
}
