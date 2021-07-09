import {
  ContextButton,
  formatButtonData,
  inlineKeyboard,
} from '@jace1995/telegram-handler'
import { auth, forUnion } from '../../../helpers/user'

import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'
import { LocationData } from './helpers/types'

export const locationInfo: (
  Handler<Action.location_info, ContextButton<LocationData>>
) = async ctx => {
  forUnion(auth(ctx, Role.leader))
  
  const location = await ctx.api.locations.findById(ctx.data.community_id, ctx.data.location_id)

  await ctx.reply(
    location.name + '\n\n' + location.text,
    inlineKeyboard([
      {
        text: 'изменить',
        callback_data: formatButtonData<LocationData>(Action.update_location, ctx.data),
      },
      {
        text: 'удалить',
        callback_data: formatButtonData<LocationData>(Action.delete_location, ctx.data),
      },
    ])
  )
}
