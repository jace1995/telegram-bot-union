import { ContextButton } from '@jace1995/telegram-handler'
import { auth, forUnion } from '../../../helpers/user'

import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'
import { replyLocationsList } from './helpers/reply-locations-list'
import { LocationData } from './helpers/types'

export const deleteLocation: (
  Handler<Action.delete_location, ContextButton<LocationData>>
) = async ctx => {
  const communityInfo = forUnion(auth(ctx, Role.leader))
  const location = await ctx.api.locations.findById(ctx.data.community_id, ctx.data.location_id)
  
  await ctx.api.locations.delete(ctx.data.community_id, ctx.data.location_id)
  await ctx.reply(`Удалена локация: ${location.name}`)
  await replyLocationsList(ctx, communityInfo.id)
}
