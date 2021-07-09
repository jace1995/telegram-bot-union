import { ContextButton, ContextText } from '@jace1995/telegram-handler'

import { replyCommunityInfo } from '../../../../helpers/reply/community-info'
import { MenuCommunityData } from '../../../../helpers/reply/menu'
import { auth, forAlliance, resetPayload, setStep } from '../../../../helpers/user'
import { findCommunity } from '../../../../helpers/utils'
import { Action } from '../../../../types/actions'
import { Handler } from '../../../../types/context'
import { Role } from '../../../../types/models'

import { beforeConfirmSaveToAllies } from './2-save-to-allies'

export const beforeInputAllyId: (
  Handler<Action.add_ally, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = forAlliance(auth(ctx, Role.leader))
  await ctx.reply('Введите идентификатор сообщества')
  await setStep(ctx, Action.add_ally_after_input_id, { community: communityInfo })
}

export const afterInputAllyId: (
  Handler<Action.add_ally_after_input_id, ContextText>
) = async ctx => {
  const communityInfo = forAlliance(auth(ctx, Role.leader))
  
  const allyId = Number(ctx.message.text)

  if (!Number.isInteger(allyId) || allyId === communityInfo.id) {
    await ctx.reply('Неправильный идентификатор, проверьте внимательнее и попробуйте снова')
    return
  }

  const ally = await findCommunity(ctx, allyId)

  if(!ally) {
    await ctx.reply('Сообщество не найдено, проверьте идентификатор и попробуйте снова')
    return
  }

  await replyCommunityInfo(ctx, ally)

  const alliance = await ctx.api.community.findById(communityInfo.id)

  if (alliance.allies.some(ally => ally.id === allyId)) {
    await ctx.reply('Сообщество уже состоит в альянсе')
    return
  }
  beforeConfirmSaveToAllies(
    resetPayload(
      ctx,
      {
        alliance,
        ally
      }
    )
  )
}
