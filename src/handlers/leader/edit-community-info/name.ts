import { ContextButton, ContextText } from '@jace1995/telegram-handler'

import { Role } from '../../../types/models'
import { Action } from '../../../types/actions'
import { auth, resetStep, setStep } from '../../../helpers/user'

import { MenuCommunityData } from '../../../helpers/reply/menu'
import { Handler } from '../../../types/context'
import { types } from '../../../setup/types'

export const beforeInputName: (
  Handler<Action.edit_community_name, ContextButton<MenuCommunityData>>
) = async ctx => {
  const community = auth(ctx, Role.leader)

  await ctx.reply('Введите новое название сообщества')
  await setStep(ctx, Action.edit_community_input_name, { community: community })
}

export const afterInputName: (
  Handler<Action.edit_community_input_name, ContextText>
) = async ctx => {
  const community = auth(ctx, Role.leader)

  const communityName = ctx.message.text

  if (communityName.length > types.length.comunityName) {
    await ctx.reply('Название слишком длинное, максимальная длина 64 символа')
    return
  }

  const communityNameExists = await ctx.api.community.nameExists(communityName)

  if (communityNameExists) {
    await ctx.reply('Такое сообщество уже существует, выберите другое название')
    return
  }

  await ctx.api.community.edit(community.id, { name: communityName })
  await ctx.reply('Название изменено')
  await resetStep(ctx)
}
