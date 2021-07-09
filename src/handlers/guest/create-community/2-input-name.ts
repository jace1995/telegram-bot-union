import { ContextText } from '@jace1995/telegram-handler'

import { Action } from '../../../types/actions'
import { resetPayload, setStep } from '../../../helpers/user'

import { beforeInputDescription } from './3-input-description'
import { CreateCommunityPayload } from './save'
import { Context, Handler } from '../../../types/context'
import { replyFirstInstruction } from '../../../helpers/reply/first-instruction'
import { types } from '../../../setup/types'

export interface InputNamePayload {
  type: CreateCommunityPayload['type']
}

export const beforeInputName = async (ctx: Context<InputNamePayload>) => {
  await ctx.reply('Введите название сообщества')
  await replyFirstInstruction(ctx, Action.create_community_input_name)
  await setStep(ctx, Action.create_community_input_name)
}

export const afterInputName: (
  Handler<Action.create_community_input_name, ContextText>
) = async ctx => {
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

  await beforeInputDescription(
    resetPayload(ctx, {
      ...ctx.user.payload,
      name: communityName,
    })
  )
}
