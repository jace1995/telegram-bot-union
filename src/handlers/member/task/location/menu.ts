import { SelectedLocationData } from './handlers'
import { CommunityType, UnionLocation } from '../../../../types/models'
import { TaskInfo, User } from '../../../../types/models'
import { TaskData } from '../common-individual-single'
import { formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { InlineKeyboardButton } from 'telegraf/typings/telegram-types'
import { Action } from '../../../../types/actions'
import { getStatus } from './status-emoji'
import { manageButtons, ManageTaskKeyboardOptions } from '../../../../helpers/keyboard'
import { MessageMenu } from '../../../../helpers/reply/update-message'
import { taskHeader } from '../common-individual-single/task-header'

const keyboard = (
  data: TaskData,
  locations: UnionLocation['locations'] | null,
  userId: User['id'],
  options: ManageTaskKeyboardOptions
) => (
  inlineKeyboard([
    ...Object.entries(manageButtons(options)).map<[InlineKeyboardButton]>(
      ([text, action]) => [{
        text,
        callback_data: formatButtonData<TaskData>(action, data),
      }]
    ),
    ...(locations ? [[{
      text: 'все',
      callback_data: formatButtonData<SelectedLocationData>(Action.location_task_select, [
        data.task_id,
        data.community_id,
      ]),
    }]] : []),
    ...(locations ? Object.keys(locations).sort().map((sublocationId) => [{
      text: (
        getStatus(locations[sublocationId], userId) +
        ` ${sublocationId} ${locations[sublocationId].name}`
      ),
      callback_data: formatButtonData<SelectedLocationData>(Action.location_task_select, [
        data.task_id,
        data.community_id,
        sublocationId,
      ]),
    }]) : []),
  ])
)

export const locationTaskMenu = async (
  task: TaskInfo,
  data: TaskData,
  userId: User['id'],
  options: ManageTaskKeyboardOptions
): Promise<MessageMenu> => {
  if (task.closed) {
    return {
      text: `завершено`,
      keyboard: keyboard(data, null, userId, options),
    }
  }

  return {
    text: taskHeader(task) + (
      options.communityType === CommunityType.union ?
        (
          'отмечайте локации, в которых участвуете\n' +
          '⏹ не выбрана\n' +
          '☑️ занята\n' +
          '✅ выполнена\n' +
          '◼️ кем-то занята\n' +
          '✔️ кем-то выполнена'
        ) :
        ''
    ),
    keyboard: keyboard(data, task.locations[data.community_id] ?? null, userId, options)
  }
}
