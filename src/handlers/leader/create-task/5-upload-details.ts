import { ContextPhoto } from '@jace1995/telegram-handler'
import { ContextDocument } from '@jace1995/telegram-handler/build/types/context'
import { menuKeyboard } from '../../../helpers/keyboard'
import { auth, AuthPayload, setStep } from '../../../helpers/user'

import { Action } from '../../../types/actions'
import { Context, Handler } from '../../../types/context'
import { Role, TaskType } from '../../../types/models'
import { beforeInputMembersAmount } from './6-input-members-amount'
import { beforeSelectLocation } from './6-select-locations'

import { CreateTaskPayload } from './8-save'

export interface UploadTaskDetailsPayload extends AuthPayload {
  type: CreateTaskPayload['type']
  role: CreateTaskPayload['role']
  title: CreateTaskPayload['title']
  description: CreateTaskPayload['description']
  images: CreateTaskPayload['images']
  documents: CreateTaskPayload['documents']
}

export const beforeUploadDetails = async (ctx: Context<UploadTaskDetailsPayload>) => {
  await ctx.reply(
    'Прикрепите уточняющие изображения или документы, если нужно, после чего нажмите "дальше"',
    menuKeyboard({
      ['дальше']: Action.create_task_upload_details
    })
  )
  await setStep(ctx, Action.create_task_upload_details)
}

export const afterUploadPhoto: (
  Handler<Action.create_task_upload_details, ContextPhoto>
) = async ctx => {
  auth(ctx, Role.leader)
  ctx.user.payload.images.push(ctx.message.photo[0].file_id)
  await setStep(ctx, Action.create_task_upload_details)
}

export const afterUploadDocument: (
  Handler<Action.create_task_upload_details, ContextDocument>
) = async ctx => {
  auth(ctx, Role.leader)
  ctx.user.payload.documents.push(ctx.message.document.file_id)
  await setStep(ctx, Action.create_task_upload_details)
}

export const afterEndUpload: (
  Handler<Action.create_task_upload_details>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)
  
  switch (ctx.user.payload.type) {
    case TaskType.single:
    case TaskType.individual:
      return beforeInputMembersAmount(ctx)
    case TaskType.location:
      return beforeSelectLocation(ctx, communityInfo.id)
  }
}
