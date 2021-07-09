import { ContextButton } from '@jace1995/telegram-handler'
import { MenuCommunityData } from '../../../helpers/reply/menu'

import { auth, forUnion } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Community, Role } from '../../../types/models'
import { replyLocationsList } from './helpers/reply-locations-list'

export interface ManageLocationsPayload {
  communityId: Community['id']
}

export const locationsList: (
  Handler<Action.locations_list, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = forUnion(auth(ctx, Role.leader))
  await replyLocationsList(ctx, communityInfo.id)
}
