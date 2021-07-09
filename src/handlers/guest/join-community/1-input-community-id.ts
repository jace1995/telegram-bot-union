import { ContextText } from '@jace1995/telegram-handler'

import { Action } from '../../../types/actions'
import { replyCommunityInfo } from '../../../helpers/reply/community-info'
import { replyFirstInstruction } from '../../../helpers/reply/first-instruction'
import { resetPayload, setStep } from '../../../helpers/user'

import { beforeConfirmJoin, JoinUnionPayload } from './2-confirm'
import { Handler } from '../../../types/context'
import { validID } from '../../../helpers/utils'

export const beforeInputUnionId: Handler<Action.join_community> = async ctx => {
  await ctx.reply('Вступить в сообщество')
  await replyFirstInstruction(ctx, Action.join_community)
  await ctx.reply('Введите идентификатор сообщества')
  await setStep(ctx, Action.join_community_input_id, null)
}

export const afterInputUnionId: (
  Handler<Action.join_community_input_id, ContextText>
) = async ctx => {
  const unionId = Number(ctx.message.text)

  if (!validID(unionId)) {
    await ctx.reply('Неправильный идентификатор, проверьте внимательнее и попробуйте снова')
    return
  }

  const community = await ctx.api.community.findById(unionId)

  if (!community) {
    await ctx.reply('Сообщество не найдено, проверьте идентификатор и попробуйте снова')
    return
  }

  await replyCommunityInfo(ctx, community)

  if (community.closed) {
    return
  }

  if (community.users.all.some(memberId => memberId === ctx.user.id)) {
    await ctx.reply('Вы уже являетесь участником этого сообщества')
    return
  }

  await beforeConfirmJoin(
    resetPayload<JoinUnionPayload>(ctx, community)
  )
}
