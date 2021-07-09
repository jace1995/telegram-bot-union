import { ContextPhoto } from '@jace1995/telegram-handler'

import { Action } from '../../../types/actions'
import { skipButton } from '../../../helpers/keyboard'
import { resetPayload, setStep } from '../../../helpers/user'

import { CreateCommunityPayload, saveNewCommunity } from './save'
import { Context, Handler } from '../../../types/context'
import { replyFirstInstruction } from '../../../helpers/reply/first-instruction'

export interface UploadImagePayload {
  type: CreateCommunityPayload['type']
  name: CreateCommunityPayload['name']
  description: CreateCommunityPayload['description']
}

export const beforeUploadImage = async (ctx: Context<UploadImagePayload>) => {
  await ctx.reply(
    'Загрузите изображение сообщества',
    skipButton(Action.create_community_upload_image)
  )
  await replyFirstInstruction(ctx, Action.create_community_upload_image)
  await setStep(ctx, Action.create_community_upload_image)
}

export const afterUploadImage: (
  Handler<Action.create_community_upload_image, ContextPhoto>
) = async ctx => {
  await saveNewCommunity(
    resetPayload<CreateCommunityPayload>(ctx, {
      ...ctx.user.payload,
      image: ctx.message.photo[0].file_id,
    })
  )
}

export const afterUploadImageSkip: (
  Handler<Action.create_community_upload_image>
) = async ctx => {
  await saveNewCommunity(
    resetPayload<CreateCommunityPayload>(ctx, {
      ...ctx.user.payload,
      image: undefined,
    })
  )
}
