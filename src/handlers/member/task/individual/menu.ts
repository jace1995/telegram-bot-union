import { manageTaskButtons, ManageTaskKeyboardOptions } from '../../../../helpers/keyboard'
import { MessageMenu } from '../../../../helpers/reply/update-message'
import { CommunityType, TaskInfo, TaskProgress } from '../../../../types/models'
import { TaskData } from '../common-individual-single'
import { taskHeader } from '../common-individual-single/task-header'
import { keyboard } from './keyboard'

const action = (progress: TaskInfo['progress']): string => {
  switch (progress) {
    case TaskProgress.doing:
      return '☑️ вы участвуете'
    case TaskProgress.done:
      return '✅ вы приняли участие'
  }
  return '❌ вы не участвуете'
}

export const individualTaskMenu = async (
  task: TaskInfo,
  data: TaskData,
  options: ManageTaskKeyboardOptions
): Promise<MessageMenu> => {
  const status = options.communityType === CommunityType.union ? (
    task.closed ?
      `завершено, участие приняли ${task.done} из ${task.required}` :
      (
        (task.required !== 1 ? `требуется участников ${task.required})\n` : '') +
        `планируют участвовать ${task.doing}\n` +
        `приняли участие ${task.done}\n` +
        action(task.progress)
      )
  ) : ''

  return {
    text: taskHeader(task) + status,
    keyboard: !task.closed && options.communityType === CommunityType.union ?
      keyboard(data, task.progress, options) :
      manageTaskButtons(data, options)
  }
}
