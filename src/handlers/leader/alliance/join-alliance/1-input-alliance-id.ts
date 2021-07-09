import { ContextButton, ContextText } from '@jace1995/telegram-handler'
import { replyCommunityInfo } from '../../../../helpers/reply/community-info'
import { replyFirstInstruction } from '../../../../helpers/reply/first-instruction'
import { MenuCommunityData } from '../../../../helpers/reply/menu'
import { auth, resetPayload, setStep } from '../../../../helpers/user'
import { findCommunity, validID } from '../../../../helpers/utils'
import { Action } from '../../../../types/actions'
import { Handler } from '../../../../types/context'
import { CommunityType, Role } from '../../../../types/models'
import { beforeConfirmJoinAlliance } from './2-confirm'

export const beforeInputAllianceId: (
  Handler<Action.alliance_join, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)

  await ctx.reply('Вступить в альянс')

  await replyFirstInstruction(ctx, Action.alliance_join)

  await ctx.reply('Введите идентификатор альянса')

  await setStep(ctx, Action.alliance_join_after_input_id, { community: communityInfo })
}

export const afterInputAllianceId: (
  Handler<Action.alliance_join_after_input_id, ContextText>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)
  const allianceId = Number(ctx.message.text.trim())

  if (!validID(allianceId) || allianceId === communityInfo.id) {
    await ctx.reply('Неправильный идентификатор, проверьте внимательнее и попробуйте снова')
    return
  }

  const alliance = await findCommunity(ctx, allianceId, CommunityType.alliance)

  if (!alliance) {
    await ctx.reply('Альянс не найден, проверьте идентификатор и попробуйте снова')
    return
  }

  if (alliance.type !== CommunityType.alliance) {
    await ctx.reply(
      'Это объединение, сообщество может вступать только в альянсы. ' +
      'Выберите альянс и попробуйте снова.'
    )
    return
  }

  await replyCommunityInfo(ctx, alliance)

  if (alliance.allies.some(ally => ally.id === communityInfo.id)) {
    await ctx.reply('Сообщество уже состоит в этом альянсе')
    return
  }
  
  if (allianceId === communityInfo.id) {
    await ctx.reply('Альянс не может вступить сам в себя :)')
    return
  }

  if (await ctx.api.alliance.foundCircularNesting({
    allyId: communityInfo.id,
    allianceId: allianceId,
  })) {
    await ctx.reply(
      'Вы не можете добавить сообщество в этот альянс, ' +
      'поскольку альянс уже сам состоит в вашем сообществе или в одном из его участников'
    )
    return
  }

  beforeConfirmJoinAlliance(
    resetPayload(
      ctx,
      {
        communityId: communityInfo.id,
        alliance
      }
    )
  )
}
