import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { $enum } from 'ts-enum-util'

import { CommunityType } from '../../../types/models'
import { Action } from '../../../types/actions'
import { resetPayload, setStep } from '../../../helpers/user'
import { replyFirstInstruction } from '../../../helpers/reply/first-instruction'
import { Handler } from '../../../types/context'

import { beforeInputName } from './2-input-name'
import { CreateCommunityPayload } from './save'

const types = $enum(CommunityType).getValues()

const labelsCommunityType: Record<CommunityType, string> = {
  [CommunityType.union]: 'Объединение',
  [CommunityType.alliance]: 'Альянс',
}

interface SelectTypeData {
  type: CreateCommunityPayload['type']
}

export const beforeSelectType: Handler<Action.create_community> = async ctx => {
  await ctx.reply('Создать сообщество')
  await replyFirstInstruction(ctx, Action.create_community)
  await ctx.reply(
    'Выберите тип сообщества',
    inlineKeyboard(
      types.map(type => ({
        text: labelsCommunityType[type],
        callback_data: formatButtonData<SelectTypeData>(
          Action.create_community_select_type,
          { type }
        )
      }))
    )
  )
  await setStep(ctx, Action.create_community_select_type, null)
}

export const afterSelectType: (
  Handler<Action.create_community_select_type, ContextButton<SelectTypeData>>
) = async ctx => {
  const communityType = ctx.data.type

  if (!types.includes(communityType)) {
    throw new Error('unknown community type: ' + communityType)
  }

  await ctx.reply(labelsCommunityType[communityType])
  
  await beforeInputName(
    resetPayload(ctx, { type: communityType })
  )
}
