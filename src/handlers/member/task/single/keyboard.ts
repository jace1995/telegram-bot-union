import { ManageTaskKeyboardOptions, manageTaskButtons } from '../../../../helpers/keyboard'
import { Action } from '../../../../types/actions'
import { Optional, Role, TaskProgress, TaskQueue } from '../../../../types/models'
import { TaskData } from '../common-individual-single'

export const keyboard = (
  data: TaskData,
  progress: Optional<TaskProgress | TaskQueue>,
  options: ManageTaskKeyboardOptions
) => {
  if (progress === TaskProgress.done) {
    return manageTaskButtons(data, options, {})
  }

  const buttons: Record<string, Action> = {}

  // лидер
  if (options.role === Role.leader) {
    buttons['📢 позвать из очереди'] = Action.call_waiting_members
  }

  // не участвует
  if (!progress) {
    buttons['участвовать'] = Action.single_task_doing
    buttons['стать в очередь'] = Action.single_task_wait
  }

  // в очереди
  if (progress === TaskQueue.wait) {
    buttons['участвовать'] = Action.single_task_doing
    buttons['выйти из очереди'] = Action.single_task_cancel
  }

  // участвует
  if (progress === TaskProgress.doing) {
    buttons['выполнена'] = Action.single_task_done
    buttons['передумал'] = Action.single_task_cancel
  }

  return manageTaskButtons(data, options, buttons)
}
