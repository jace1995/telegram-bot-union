import { authForTask, ContextTask } from './auth'
import { updateTaskMessage } from './update-message'
import { ChangeProgressProps, updateProgress } from './update-progress'

export const authAndHandleChangeProgress = async (
  ctx: ContextTask,
  change: ChangeProgressProps
) => {
  const info = await authForTask(ctx)

  if (!info.closed) {
    await updateProgress(ctx, change)
  }

  const taskInfo = await updateTaskMessage(ctx)

  return taskInfo
}
