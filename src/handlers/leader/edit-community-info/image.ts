import { ContextButton, ContextPhoto, ContextText } from '@jace1995/telegram-handler'

import { Role, User } from '../../../types/models'
import { Api } from '../../../types/api'
import { Action } from '../../../types/actions'
import { auth, AuthPayload, resetStep, setStep } from '../../../helpers/user'

import { MenuCommunityData } from '../../../helpers/reply/menu'
import { menuKeyboard } from '../../../helpers/keyboard'
import { Handler } from '../../../types/context'

export const beforeUploadImage: (
  Handler<Action.edit_community_image, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)

  const community = await ctx.api.community.findById(ctx.data.community_id)

  await ctx.reply(
    'Загрузите новое изображение',
    community.image ? menuKeyboard({
      ['удалить изображение']: Action.edit_community_upload_image
    }) : undefined
  )
  await setStep(ctx, Action.edit_community_upload_image, { community: communityInfo })
}

export const afterUploadImage: (
  Handler<Action.edit_community_upload_image, ContextPhoto>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)

  const communityImage = ctx.message.photo[0].file_id

  await ctx.api.community.edit(communityInfo.id, { image: communityImage })
  await ctx.reply('Изображение изменено')
  await resetStep(ctx)
}

export const afterDeleteImage: (
  Handler<Action.edit_community_upload_image>
) = async ctx => {
  const community = auth(ctx, Role.leader)
  await ctx.api.community.edit(community.id, { image: undefined })
  await ctx.reply('Изображение удалено')
  await resetStep(ctx)
}
