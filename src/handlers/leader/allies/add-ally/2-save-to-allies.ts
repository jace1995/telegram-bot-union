import { ContextButton } from '@jace1995/telegram-handler'
import { confirmButton } from '../../../../helpers/keyboard'
import { Context, Handler } from '../../../../types/context'
import { Community, Role } from '../../../../types/models'
import { Action } from '../../../../types/actions'
import { replyAlert } from '../../../../helpers/reply/alert'
import { auth, forAlliance, resetStep, setStep } from '../../../../helpers/user'

export interface AddAllyPayload {
  alliance: Community
  ally: Community
}

export const beforeConfirmSaveToAllies = async (ctx: Context<AddAllyPayload>) => {
  await ctx.reply(
    'Присоединить к альянсу?',
    confirmButton(Action.add_ally_save)
  )

  await setStep(ctx, Action.add_ally_save)
}

export const afterConfirmSaveToAllies: (
  Handler<Action.add_ally_save, ContextButton>
) = async ctx => {
  const { alliance, ally } = ctx.user.payload

  forAlliance(auth(ctx, Role.leader, alliance.id))

  const invite = await ctx.api.alliance.getInviter({
    allianceId: alliance.id,
    allyId: ally.id,
  })
  const allianceLeaders = alliance.users.leaders

  if (invite === null) {
    await ctx.api.alliance.sendInvite({
      alliance_id: alliance.id,
      ally_id: ctx.user.payload.ally.id,
      inviter_id: alliance.id
    })

    await replyAlert(
      ctx,
      allianceLeaders,
      `Альянс ${alliance.name} разрешил присоединение сообщества ${ally.name}`
    )
    return
  }

  await ctx.api.alliance.join({allianceId: alliance.id, allyId: ally.id})
  await ctx.api.alliance.cancelInvite({allianceId: alliance.id, allyId: ally.id})

  await replyAlert(
    ctx,
    [...ally.users.leaders, ...allianceLeaders],
    `Сообщество ${ally.name} присоединилось к альянсу ${alliance.name}`
  )
  
  await resetStep(ctx)
}
