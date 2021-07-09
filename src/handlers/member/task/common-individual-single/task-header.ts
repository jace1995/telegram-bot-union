import { labelsRole } from '../../../../types/labels'
import { TaskInfo, TaskType } from '../../../../types/models'

const labelsTaskType: Record<TaskType, string> = {
  [TaskType.single]: 'Разовое',
  [TaskType.individual]: 'Индивидуальное',
  [TaskType.location]: 'Локационное',
}

export const taskHeader = (task: TaskInfo) => (
  `${labelsTaskType[task.type]} задание для роли "${labelsRole[task.role]}"\n` +
  (task.unions_count > 1 ? `объединений в задании: ${task.unions_count}\n` : '')
)
