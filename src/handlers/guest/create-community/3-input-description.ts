import { ContextText } from '@jace1995/telegram-handler'

import { Action } from '../../../types/actions'
import { skipButton } from '../../../helpers/keyboard'
import { resetPayload, setStep } from '../../../helpers/user'

import { beforeUploadImage } from './4-upload-image'
import { CreateCommunityPayload } from './save'
import { Context, Handler } from '../../../types/context'
import { types } from '../../../setup/types'
import { replyFirstInstruction } from '../../../helpers/reply/first-instruction'

export interface InputDescriptionPayload {
  type: CreateCommunityPayload['type']
  name: CreateCommunityPayload['name']
}

export const beforeInputDescription = async (ctx: Context<InputDescriptionPayload>) => {
  await ctx.reply(
    'Введите описание сообщества',
    skipButton(Action.create_community_input_description)
  )
  await replyFirstInstruction(ctx, Action.create_community_input_description)
  await setStep(ctx, Action.create_community_input_description)
}

export const afterInputDescription: (
  Handler<Action.create_community_input_description, ContextText>
) = async ctx => {
  const communityDescription = ctx.message.text

  if (communityDescription.length > types.length.comunityDescription) {
    await ctx.reply('Описание слишком длинное, максимальная длина 255 символов')
    return
  }

  await beforeUploadImage(
    resetPayload(ctx, {
      ...ctx.user.payload,
      description: communityDescription,
    })
  )
}

export const afterInputDescriptionSkip: (
  Handler<Action.create_community_input_description>
) = async ctx => {
  await beforeUploadImage(
    resetPayload(ctx, {
      ...ctx.user.payload,
      description: undefined,
    })
  )
}

