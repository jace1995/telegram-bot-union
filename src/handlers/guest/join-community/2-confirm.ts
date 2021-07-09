import { menuKeyboard } from '../../../helpers/keyboard'
import { menu } from '../../../helpers/reply/menu'

import { resetStep, setStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Context, Handler } from '../../../types/context'
import { Community, Role } from '../../../types/models'

export interface JoinUnionPayload extends Community {}

export const beforeConfirmJoin = async (ctx: Context<JoinUnionPayload>) => {
  await ctx.reply(
    'Хотите вступить в это объединение?',
    menuKeyboard({
      ['вступить']: Action.join_community_confirm
    })
  )
  await setStep(ctx, Action.join_community_confirm)
}

export const afterConfirmJoin: Handler<Action.join_community_confirm> = async ctx => {
  const community = ctx.user.payload

  await ctx.api.member.joinCommunity({
    community_id: community.id,
    user_id: ctx.user.id,
    role: Role.member
  })

  await ctx.reply(...menu({
    ...community,
    role: Role.member,
  }))
  await resetStep(ctx)
}
