import { ContextButton } from '@jace1995/telegram-handler'
import { DialogPrevented } from '@jace1995/telegram-handler/build/start/error-handler'
import { updateMessage } from '../../../../helpers/reply/update-message'
import { Action } from '../../../../types/actions'
import { Handler } from '../../../../types/context'
import { UnionLocationItem, isLocationCategory, Role } from '../../../../types/models'
import { TaskData } from '../common-individual-single'
import { authForTask } from '../common-individual-single/auth'
import { locationTaskMenu } from './menu'
import { Counter, setNextCategoryProgress, setNextItemProgress } from './next-progress'

export type SelectedLocationData = (
  [TaskData['task_id'], TaskData['community_id']] |
  [TaskData['task_id'], TaskData['community_id'], string]
)

export const selectLocation: (
  Handler<Action.location_task_select, ContextButton<SelectedLocationData>>
) = async (ctx) => {
  const [taskId, communityId, sublocationId] = ctx.data

  const authResult = await authForTask(ctx, {
    task_id: taskId,
    community_id: communityId,
  })

  const userId = ctx.user.id

  const task = await ctx.api.task.info({ userId, taskId, communityId })

  if (!task || !task.locations) {
    throw new DialogPrevented()
  }

  const locations = task.locations[communityId]
  const counter: Counter = {
    wasChanges: false
  }

  if (!task.closed) {
    if (sublocationId) { // выбранная под-локация
      const sublocation = locations[sublocationId]

      if (isLocationCategory(sublocation)) { // все в категории
        setNextCategoryProgress(
          sublocation.items.map(
            id => locations[id] as UnionLocationItem
          ).filter(item => (
            !item.participant ||
            item.participant.user_id === userId
          )),
          userId,
          counter
        )
      } else { // единственная под-локация
        setNextItemProgress(sublocation, userId, counter)
      }
    }
    else { // все доступные локации
      const sublocations = Object.values(locations).filter(
        sublocation => !isLocationCategory(sublocation) && (
          !sublocation.participant ||
          sublocation.participant.user_id === userId
        )
      ) as UnionLocationItem[]

      setNextCategoryProgress(
        sublocations,
        userId,
        counter
      )
    }
  }

  if (counter.wasChanges) {
    task.locations[communityId] = await ctx.api.task.updateLocations(
      { userId, taskId, communityId },
      locations
    )
  }

  const menu = await locationTaskMenu(task, {
    task_id: taskId,
    community_id: communityId,
  }, userId, {
    role: authResult.community.role,
    communityType: authResult.community.type,
    taskClosed: task.closed,
  })

  await updateMessage(ctx, menu)
}
