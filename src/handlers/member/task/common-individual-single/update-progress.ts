import { TaskProgress, TaskQueue, TaskType } from '../../../../types/models'
import { ContextTask } from './auth'

export type ChangeProgressProps = {
  type: TaskType.single
  progress: TaskProgress | TaskQueue | undefined
} | {
  type: TaskType.individual
  progress: TaskProgress | undefined
}

const updateSingleTask = async (ctx: ContextTask, progress: TaskProgress | TaskQueue | undefined) => {
  await ctx.api.task.changeMembersProgress({
    taskId: ctx.data.task_id,
    userId: ctx.user.id,
    progress,
  })
}

const updateIndividualTask = async (ctx: ContextTask, progress: TaskProgress | undefined) => {
  await ctx.api.task.changeMembersProgress({
    taskId: ctx.data.task_id,
    userId: ctx.user.id,
    progress,
  })
}

export const updateProgress = (ctx: ContextTask, change: ChangeProgressProps) => {
  switch (change.type) {
    case TaskType.single:
      return updateSingleTask(ctx, change.progress)

    case TaskType.individual:
      return updateIndividualTask(ctx, change.progress)
  }
}
