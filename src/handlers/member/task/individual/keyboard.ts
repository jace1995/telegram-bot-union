import { manageTaskButtons, ManageTaskKeyboardOptions } from '../../../../helpers/keyboard'
import { Action } from '../../../../types/actions'
import { Optional, Role, TaskProgress, TaskQueue } from '../../../../types/models'
import { TaskData } from '../common-individual-single'

export const keyboard = (
  data: TaskData,
  progress: Optional<TaskProgress | TaskQueue>,
  options: ManageTaskKeyboardOptions
) => {
  const buttons: Record<string, Action> = {}

  // лидер
  if (options.role === Role.leader) {
    buttons['🔔 напомнить подтвердить участие'] = Action.remind_confirm
  }

  // не участвует
  if (!progress) {
    buttons['участвовать'] = Action.individual_task_doing
  }

  // участвует
  if (progress === TaskProgress.doing) {
    buttons['принял участие'] = Action.individual_task_done
    buttons['передумал'] = Action.individual_task_cancel
  }

  // принял участие
  if (progress === TaskProgress.done) {
    buttons['отмена'] = Action.individual_task_cancel
  }

  return manageTaskButtons(data, options, buttons)
}
