import { ContextButton, ContextText } from '@jace1995/telegram-handler'
import { replyFirstInstruction } from '../../../helpers/reply/first-instruction'
import { auth, forUnion, resetPayload, setStep } from '../../../helpers/user'

import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'
import { LocationData } from './helpers/types'
import { inputLocations } from './input-locations'

export const beforeInputName: (
  Handler<Action.create_location, ContextButton<LocationData>>
) = async ctx => {
  const community = forUnion(auth(ctx, Role.leader))
  await replyFirstInstruction(ctx, Action.manage_role)
  await ctx.reply('Введите название новой локации')
  await setStep(ctx, Action.input_location_name, { community: community })
}

export const afterInputName: (
  Handler<Action.input_location_name, ContextText>
) = async ctx => {
  forUnion(auth(ctx, Role.leader))

  const locationName = ctx.message.text

  await inputLocations(
    resetPayload(ctx, {
      ...ctx.user.payload,
      name: locationName,
    })
  )
}
