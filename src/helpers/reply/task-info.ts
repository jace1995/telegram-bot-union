import { TaskData } from '../../handlers/member/task/common-individual-single'
import { individualTaskMenu } from '../../handlers/member/task/individual/menu'
import { locationTaskMenu } from '../../handlers/member/task/location/menu'
import { singleTaskMenu } from '../../handlers/member/task/single/menu'
import { Context } from '../../types/context'
import {
  CommunityInfo, CommunityType, MemberInfo,
  Role, Task, TaskInfo, TaskType, User,
} from '../../types/models'

import { ManageTaskKeyboardOptions } from '../keyboard'
import { MessageMenu } from './update-message'

export const taskActionsMenu = async (
  task: TaskInfo,
  data: TaskData,
  userId: User['id'],
  role: Role,
  communityType: CommunityType
): Promise<MessageMenu> => {
  const options: ManageTaskKeyboardOptions = {
    role,
    communityType,
    taskClosed: task.closed,
  }

  switch (task.type) {
    case TaskType.single:
      return singleTaskMenu(task, data, options)
    case TaskType.individual:
      return individualTaskMenu(task, data, options)
    case TaskType.location:
      return locationTaskMenu(task, data, userId, options)
  }
  throw new Error('unknown task type')
}

export interface ShortTaskInfo {
  id: Task['id']
  title: Task['title']
  description: Task['details']['description']
  images: Task['details']['images']
  documents:  Task['details']['documents']
}

export const isTaskInfo = (t: any): t is TaskInfo => typeof t.progress !== 'undefined';

export const replyTaskInfo = async (
  ctx: Context,
  taskInfo: TaskInfo | ShortTaskInfo,
  communityInfo: CommunityInfo,
  userIds: User['id'] | User['id'][]
) => {
  const users = await ctx.api.user.availableChats(Array.isArray(userIds) ? userIds : [userIds])

  await Promise.all(
    users.map(async user => {
      try {
        const text = (
          `Задание от сообщества "${communityInfo.name}": ${taskInfo.title}\n\n` +
          taskInfo.description
        )
      
        if (taskInfo.images.length === 1) {
          await ctx.telegram.sendPhoto(user.chat, taskInfo.images[0], {
            caption: text
          })
        }
        else {
          await ctx.telegram.sendMessage(user.chat, text)
        }
      
        if (taskInfo.images.length > 1) {
          await ctx.telegram.sendMediaGroup(
            user.chat,
            taskInfo.images.map(media => ({
              type: 'photo',
              media,
            }))
          )
        }
      
        await Promise.all(
          taskInfo.documents.map(document => (
            ctx.telegram.sendDocument(user.chat, document)
          ))
        )
      
        const data: TaskData = {
          task_id: taskInfo.id,
          community_id: communityInfo.id,
        }
      
        if (isTaskInfo(taskInfo)) {
          const menu = await taskActionsMenu(
            taskInfo,
            data,
            user.id,
            communityInfo.role,
            communityInfo.type
          )

          await ctx.telegram.sendMessage(
            user.chat,
            menu.text,
            menu.keyboard && menu.keyboard
          )
        }
      }
      catch (e) {
        console.error(e)
      }
    })
  )
}

export const replyTaskById = async (
  ctx: Context,
  taskId: Task['id'],
  communityInfo: CommunityInfo,
) => {
  const taskInfo = await ctx.api.task.info({
    userId: ctx.user.id,
    taskId: taskId,
    communityId: communityInfo.id,
  })

  if (!taskInfo) {
    await ctx.reply(`Упс, задача не найдена 🤷‍♀️`)
    return
  }

  await replyTaskInfo(ctx, taskInfo, communityInfo, ctx.user.id)
}
