import { ContextButton, ContextText } from '@jace1995/telegram-handler'
import { parseOrReplyError, replyLocationsExample } from '../../../helpers/locations-helpers'
import { auth, setStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Context, Handler } from '../../../types/context'
import { Community, Role } from '../../../types/models'
import { replyLocationsList } from '../manage-locations/helpers/reply-locations-list'
import { LocationData } from '../manage-locations/helpers/types'
import { confirmNewTask } from './7-confirm'
import { CreateTaskPayload } from './8-save'

export const beforeSelectLocation = async (
  ctx: Context<CreateTaskPayload>,
  communityId: Community['id']
) => {
  await replyLocationsList(ctx, communityId, {
    messageIfLocationsExists: 'Выберите локацию или создайте новую',
    messageIfLocationsNotExists: 'Локации не созданы, создайте новую временную локацию',
    onSelect: Action.create_task_select_location,
    onCreate: Action.create_task_select_location,
  })

  await setStep(ctx, Action.create_task_select_location)
}

export const afterSelectLocation: (
  Handler<Action.create_task_select_location, ContextButton<Partial<LocationData>>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)
  const locationId = ctx.data.location_id

  if (locationId) {
    const locations = await ctx.api.locations.findById(
      ctx.user.payload.community.id,
      locationId,
    )

    ctx.user.payload.locations = {
      [communityInfo.id]: locations.locations
    }

    ctx.user.payload.locationsName = locations.name

    await confirmNewTask(ctx)
  }
  else {
    await replyLocationsExample(ctx)
    await setStep(ctx, Action.create_task_create_temp_location)
  }
}

export const afterInputTemplateLocation: (
  Handler<Action.create_task_create_temp_location, ContextText>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)
  const locations = await parseOrReplyError(ctx)

  ctx.user.payload.locations = {
    [communityInfo.id]: locations
  }

  await confirmNewTask(ctx)
}
