import { ExtraReplyMessage } from 'telegraf/typings/telegram-types'
import { inlineKeyboard, formatButtonData } from '@jace1995/telegram-handler'
import { TaskData } from '../handlers/member/task/common-individual-single'
import { Action } from '../types/actions'
import { CommunityType, Role } from '../types/models'

export const menuKeyboard = <D>(menu: Record<string, Action>, data?: D) => inlineKeyboard(
  Object.entries(menu).map(([text, action]) => ([{
    text,
    callback_data: data ? formatButtonData(action, data) : action,
  }]))
)

export const skipButton = (action: string) => inlineKeyboard({
  text: 'пропустить',
  callback_data: action,
})

export const taskInfoButton = (data: TaskData) => inlineKeyboard({
  text: 'подробнее',
  callback_data: formatButtonData<TaskData>(Action.task_info, data),
})

export const confirmButton = <Data = unknown>(action: Action, payload?: Data) => inlineKeyboard({
  text: 'подтвердить',
  callback_data: formatButtonData<Data>(action, payload)
})

export interface ManageTaskKeyboardOptions {
  taskClosed: boolean
  role: Role
  communityType: CommunityType
}

export const manageButtons = (options: ManageTaskKeyboardOptions) => {
  const buttons: Record<string, Action> = {}

  if (options.taskClosed) {
    buttons['🔓 сделать активным'] = Action.open_task
  }
  else {
    buttons['🔄 обновить'] = Action.update_task_message

    if (options.role === Role.leader) {
      if (options.communityType === CommunityType.alliance) {
        buttons['📊 статистика'] = Action.task_stats
      }
  
      buttons['🔐 завершить'] = Action.close_task
      buttons['➡️ переслать'] = Action.forward_task
    }
  }

  return buttons
}

export const manageTaskButtons = (
  data: TaskData,
  options: ManageTaskKeyboardOptions,
  buttons: Record<string, Action> = {},
): ExtraReplyMessage => (
  menuKeyboard<TaskData>({
    ...manageButtons(options),
    ...buttons,
  }, data)
)
