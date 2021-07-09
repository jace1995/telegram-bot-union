import { ContextButton, ContextText } from '@jace1995/telegram-handler'
import { Action } from '../../../../../types/actions'
import { parseOrReplyError, replyLocationsExample } from '../../../../../helpers/locations-helpers'
import { auth, setStep } from '../../../../../helpers/user'
import { Context, Handler } from '../../../../../types/context'
import { CommunityInfo, Role, UnionSublocation } from '../../../../../types/models'
import { replyLocationsList } from '../../../manage-locations/helpers/reply-locations-list'
import { LocationData } from '../../../manage-locations/helpers/types'
import { applyAcceptTask, ApplyAcceptTaskPayload } from './3-accept-task'

export const beforeSelectLocation = async (ctx: Context<ApplyAcceptTaskPayload>) => {
  await replyLocationsList(ctx, ctx.user.payload.community.id, {
    messageIfLocationsExists: 'Выберите локацию или создайте новую',
    messageIfLocationsNotExists: 'Локации не созданы, создайте новую временную локацию',
    onSelect: Action.accept_task_select_location,
    onCreate: Action.accept_task_select_location,
  })

  await setStep(ctx, Action.accept_task_select_location)
}

const acceptTask = async (
  ctx: Context<ApplyAcceptTaskPayload>,
  communityInfo: CommunityInfo,
  locations: Record<string, UnionSublocation>,
) => {
  const taskId = ctx.user.payload.taskId

  await ctx.api.task.addLocations({
    taskId,
    communityId: communityInfo.id,
    locations,
  })

  const task = await ctx.api.task.findById(ctx.user.payload.taskId)
  
  await applyAcceptTask(ctx, communityInfo, task)
}

export const afterSelectLocation: (
  Handler<Action.accept_task_select_location, ContextButton<Partial<LocationData>>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader, ctx.user.payload.community.id)
  const locationId = ctx.data.location_id

  if (locationId) {
    const communityLocations = await ctx.api.locations.findById(
      ctx.user.payload.community.id,
      locationId,
    )

    await acceptTask(ctx, communityInfo, communityLocations.locations)
  }
  else {
    await replyLocationsExample(ctx)
    await setStep(ctx, Action.accept_task_create_temp_location)
  }
}

export const afterInputTemplateLocation: (
  Handler<Action.accept_task_create_temp_location, ContextText>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader, ctx.user.payload.community.id)
  const locations = await parseOrReplyError(ctx)

  await acceptTask(ctx, communityInfo, locations)
}
