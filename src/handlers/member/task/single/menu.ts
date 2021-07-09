import { manageTaskButtons, ManageTaskKeyboardOptions } from '../../../../helpers/keyboard'
import { MessageMenu } from '../../../../helpers/reply/update-message'
import { CommunityType, TaskInfo, TaskProgress, TaskQueue } from '../../../../types/models'
import { TaskData } from '../common-individual-single'
import { taskHeader } from '../common-individual-single/task-header'
import { keyboard } from './keyboard'

const action = (progress: TaskInfo['progress']): string => {
  switch (progress) {
    case TaskProgress.doing:
      return '✅ вы участвуете'
    case TaskQueue.wait:
      return '🕓 вы ждёте в очереди'
  }
  return '❌ вы не участвуете'
}

const status = (task: TaskInfo): string => {
  if (task.done) {
    return 'выполнено'
  }

  if (task.closed) {
    return 'отменено'
  }

  const doing = (
    (task.required === 1) ?
      (
        (task.doing > 0) ?
          `уже занято, участников ${task.doing}` :
          'свободно'
      ) :
      `участвуют ${task.doing} из ${task.required}`
  )

  const wait = (
    task.wait ?
      `, в очереди участников ${task.wait}` :
      ''
  )

  return doing + wait + '\n' + action(task.progress)
}

export const singleTaskMenu = async (
  task: TaskInfo,
  data: TaskData,
  options: ManageTaskKeyboardOptions
): Promise<MessageMenu> => ({
  text: taskHeader(task) + (options.communityType === CommunityType.union ? status(task) : ''),
  keyboard: !task.closed && options.communityType === CommunityType.union ? 
    keyboard(data, task.progress, options) :
    manageTaskButtons(data, options)
})
