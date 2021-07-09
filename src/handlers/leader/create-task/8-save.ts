import {
  IndividualTaskDetails,
  LocationTaskDetails,
  SingleTaskDetails,
  TaskDetails,
  TaskInfo,
} from '../../../types/models'
import { filterMembersByAvailableRoles } from '../../../helpers/utils'
import { auth, AuthPayload, resetStep } from '../../../helpers/user'

import { Action } from '../../../types/actions'
import { NewTask } from '../../../types/api'
import { Handler } from '../../../types/context'
import { Role, TaskType } from '../../../types/models'
import { replyTaskInfo } from '../../../helpers/reply/task-info'

export interface CreateTaskPayload extends AuthPayload {
  type: NewTask['type']
  role: NewTask['role']
  title: NewTask['title']
  description: NewTask['details']['description']
  images: NewTask['details']['images']
  documents: NewTask['details']['documents']
  required?: number
  locations?: TaskInfo['locations']
  locationsName?: string
}

const commonDetails = (task: CreateTaskPayload): TaskDetails => ({
  description: task.description,
  images: task.images,
  documents: task.documents,
  ready: !task.required,
})

const singleTaskDetails = (task: CreateTaskPayload): SingleTaskDetails => ({
  ...commonDetails(task),
  participants: {},
  required: task.required ?? 1,
})

const individualTaskDetails = (task: CreateTaskPayload): IndividualTaskDetails => ({
  ...commonDetails(task),
  participants: {},
  required: task.required ?? 1,
})

const locationTaskDetails = (task: CreateTaskPayload): LocationTaskDetails => ({
  ...commonDetails(task),
  locations: task.locations ?? {},
})

const taskDetails = (task: CreateTaskPayload): NewTask['details'] => {
  switch (task.type) {
    case TaskType.single:
      return singleTaskDetails(task)
    case TaskType.individual:
      return individualTaskDetails(task)
    case TaskType.location:
      return locationTaskDetails(task)
  }
}

export const saveNewTask: (
  Handler<Action.create_task_save>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)
  const taskPayload = ctx.user.payload

  const newTask = {
    type: taskPayload.type,
    role: taskPayload.role,
    title: taskPayload.title,
    details: taskDetails(taskPayload),
  }
  
  const taskId = await ctx.api.task.create(newTask)
  
  await ctx.api.task.assign({
    taskId,
    recipientsIds: [communityInfo.id],
  })

  await ctx.reply('Задание опубликовано')

  const community = await ctx.api.community.findById(communityInfo.id)

  const task: TaskInfo = {
    id: taskId,
    type: taskPayload.type,
    role: taskPayload.role,
    title: taskPayload.title,
    closed: false,
    unions_count: 1,
    ready: !taskPayload.required,

    description: taskPayload.description,
    images: taskPayload.images,
    documents: taskPayload.documents,
    required: taskPayload.required ?? 1,
    locations: taskPayload.locations ?? {},

    progress: null,
    wait: 0,
    doing: 0,
    done: 0,
  }

  await replyTaskInfo(
    ctx, task, communityInfo,
    filterMembersByAvailableRoles(community.users, taskPayload.role)
  )
  await resetStep(ctx)
}
