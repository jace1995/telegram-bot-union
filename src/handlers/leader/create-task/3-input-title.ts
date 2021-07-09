import { ContextText } from '@jace1995/telegram-handler'
import { auth, AuthPayload, resetPayload, setStep } from '../../../helpers/user'
import { types } from '../../../setup/types'
import { Action } from '../../../types/actions'
import { Context, Handler } from '../../../types/context'
import { Role } from '../../../types/models'
import { beforeInputDescription } from './4-input-description'
import { CreateTaskPayload } from './8-save'

export interface InputTaskTitlePayload extends AuthPayload {
  type: CreateTaskPayload['type']
  role: CreateTaskPayload['role']
}

export const beforeInputTitle = async (ctx: Context<InputTaskTitlePayload>) => {
  await ctx.reply('Введите название задания')
  await setStep(ctx, Action.create_task_input_title)
}

export const afterInputTitle: (
  Handler<Action.create_task_input_title, ContextText>
) = async ctx => {
  auth(ctx, Role.leader)

  const title = ctx.message.text

  if (title.length > types.length.taskName) {
    ctx.reply('Слишком длинное название. Максимальная длина 64 символа')
    return
  }

  beforeInputDescription(
    resetPayload(ctx, {
      ...ctx.user.payload,
      title,
    })
  )
}
