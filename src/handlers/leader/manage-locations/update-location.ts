import { ContextButton } from '@jace1995/telegram-handler'
import { auth, forUnion, resetPayload } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'
import { LocationData } from './helpers/types'
import { inputLocations } from './input-locations'

export const updateLocation: (
  Handler<Action.update_location, ContextButton<LocationData>>
) = async ctx => {
  const communityInfo = forUnion(auth(ctx, Role.leader))

  const location = await ctx.api.locations.findById(ctx.data.community_id, ctx.data.location_id)
  
  await inputLocations(
    resetPayload(ctx, {
      community: communityInfo,
      name: location.name,
      location_id: ctx.data.location_id,
    })
  )
}
