import { ContextButton, PreventAction } from '@jace1995/telegram-handler'
import { auth } from '../../../../helpers/user'
import { TaskValidationInfo } from '../../../../types/api'
import { Context } from '../../../../types/context'
import { CommunityInfo, Task } from '../../../../types/models'

export interface TaskData {
  task_id: Task['id']
  community_id: CommunityInfo['id']
}

export type ContextTask = Context<unknown, ContextButton<TaskData>>

export interface TaskAuthResult extends TaskValidationInfo {
  community: CommunityInfo
}

export async function authForTask(ctx: ContextTask, maybeClosed?: true): Promise<TaskAuthResult>
export async function authForTask(ctx: Context, data: TaskData): Promise<TaskAuthResult>
export async function authForTask(ctx: Context, taskData?: TaskData | true): Promise<TaskAuthResult> {
  const data = typeof taskData === 'object' ? taskData : (ctx as ContextTask).data
  const maybeClosed = taskData === true

  const taskAccess = await ctx.api.task.accessInfo({
    taskId: data.task_id,
    communityId: data.community_id,
  })

  if (!taskAccess || !maybeClosed && taskAccess.closed) {
    await ctx.reply('Задача больше недоступна ⛔')
    throw new PreventAction()
  }

  const community = auth(ctx, taskAccess.role, data.community_id)

  return {
    ...taskAccess,
    community,
  }
}
