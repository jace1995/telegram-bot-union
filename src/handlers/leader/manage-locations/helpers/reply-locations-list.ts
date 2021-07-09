import { formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { InlineKeyboardButton } from 'telegraf/typings/telegram-types'
import { MenuCommunityData } from '../../../../helpers/reply/menu'
import { Action } from '../../../../types/actions'
import { Context } from '../../../../types/context'
import { Community } from '../../../../types/models'
import { LocationData } from './types'

export interface ReplyLocationsListProps {
  messageIfLocationsExists: string
  messageIfLocationsNotExists: string
  onSelect: Action
  onCreate: Action
}

const defaultProps: ReplyLocationsListProps = {
  messageIfLocationsExists: 'Список локаций',
  messageIfLocationsNotExists: 'Локации не созданы',
  onSelect: Action.location_info,
  onCreate: Action.create_location,
}

export const replyLocationsList = async (
  ctx: Context,
  communityId: Community['id'],
  props: ReplyLocationsListProps = defaultProps
) => {
  const locations = await ctx.api.locations.list(communityId)

  if (Object.keys(locations).length) {
    await ctx.reply(
      props.messageIfLocationsExists,
      inlineKeyboard([
        ...Object.entries(locations).map<InlineKeyboardButton[]>(([location_id, location]) => ([
          {
            text: location.name,
            callback_data: formatButtonData<LocationData>(props.onSelect, {
              community_id: communityId,
              location_id: location_id,
            })
          }
        ])),
        [
          {
            text: '➕',
            callback_data: formatButtonData<MenuCommunityData>(props.onCreate, {
              community_id: communityId,
            })
          }
        ]
      ])
    )
  }
  else {
    await ctx.reply(
      props.messageIfLocationsNotExists,
      inlineKeyboard([[{
        text: '➕',
        callback_data: formatButtonData<MenuCommunityData>(props.onCreate, {
          community_id: communityId,
        })
      }]])
    )
  }
}
