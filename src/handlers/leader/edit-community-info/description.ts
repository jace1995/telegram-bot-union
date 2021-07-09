import { ContextButton, ContextText } from '@jace1995/telegram-handler'

import { Role } from '../../../types/models'
import { Action } from '../../../types/actions'
import { auth, resetStep, setStep } from '../../../helpers/user'

import { MenuCommunityData } from '../../../helpers/reply/menu'
import { menuKeyboard } from '../../../helpers/keyboard'
import { Handler } from '../../../types/context'
import { types } from '../../../setup/types'

export const beforeInputDescription: (
  Handler<Action.edit_community_description, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)

  const community = await ctx.api.community.findById(ctx.data.community_id)

  await ctx.reply(
    'Введите новое описание сообщества', 
    community.description ? menuKeyboard({
      ['удалить описание']: Action.edit_community_input_description
    }) : undefined
  )
  await setStep(ctx, Action.edit_community_input_description, { community: communityInfo })
}

export const afterInputDescription: (
  Handler<Action.edit_community_input_description, ContextText>
) = async ctx => {
  const community = auth(ctx, Role.leader)

  const communityDescription = ctx.message.text.trim()

  if (communityDescription.length > types.length.comunityDescription) {
    await ctx.reply('Описание слишком длинное, максимальная длина 255 символов')
    return
  }

  await ctx.api.community.edit(community.id, { description: communityDescription })
  await ctx.reply('Описание изменено')
  await resetStep(ctx)
}

export const afterDeleteDescription: (
  Handler<Action.edit_community_input_description>
) = async ctx => {
  const community = auth(ctx, Role.leader)
  await ctx.api.community.edit(community.id, { description: undefined })
  await ctx.reply('Описание удалено')
  await resetStep(ctx)
}
