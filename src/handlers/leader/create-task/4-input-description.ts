import { ContextText } from '@jace1995/telegram-handler'
import { auth, AuthPayload, resetPayload, setStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Context, Handler } from '../../../types/context'
import { Role } from '../../../types/models'
import { beforeUploadDetails } from './5-upload-details'
import { CreateTaskPayload } from './8-save'

export interface InputTaskDescriptionPayload extends AuthPayload {
  type: CreateTaskPayload['type']
  role: CreateTaskPayload['role']
  title: CreateTaskPayload['title']
}

export const beforeInputDescription = async (ctx: Context<InputTaskDescriptionPayload>) => {
  await ctx.reply('Введите текст описания задания')
  await setStep(ctx, Action.create_task_input_description)
}

export const afterInputDescription: (
  Handler<Action.create_task_input_description, ContextText>
) = async ctx => {
  auth(ctx, Role.leader)

  beforeUploadDetails(
    resetPayload(ctx, {
      ...ctx.user.payload,
      description: ctx.message.text,
      images: [],
      documents: [],
    })
  )
}
