import { ContextText } from '@jace1995/telegram-handler'
import { parseOrReplyError, replyLocationsExample } from '../../../helpers/locations-helpers'
import { auth, AuthPayload, forUnion, resetStep, setStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Context, Handler } from '../../../types/context'
import { Role, UnionLocation } from '../../../types/models'
import { replyLocationsList } from './helpers/reply-locations-list'

export interface InputLocationPayload extends AuthPayload {
  name: string
  location_id?: string
}

export const inputLocations = async (ctx: Context<InputLocationPayload>) => {
  await replyLocationsExample(ctx)
  await setStep(ctx, Action.save_location)
}

export const afterInputLocations: (
  Handler<Action.save_location, ContextText>
) = async ctx => {
  const communityInfo = forUnion(auth(ctx, Role.leader))

  const locations = await parseOrReplyError(ctx)
  
  const unionLocation: UnionLocation = {
    name: ctx.user.payload.name,
    text: ctx.message.text,
    locations,
  }
  
  const locationId = ctx.user.payload.location_id

  if (locationId) {
    await ctx.api.locations.update(ctx.user.payload.community.id, locationId, unionLocation)
    await ctx.reply('локация изменена')
  }
  else {
    await ctx.api.locations.create(ctx.user.payload.community.id, unionLocation)
    await ctx.reply('локация создана')
  }

  await replyLocationsList(ctx, communityInfo.id)
  await resetStep(ctx)
}
