import { ContextText } from '@jace1995/telegram-handler'
import { DialogPrevented } from '@jace1995/telegram-handler/build/start/error-handler'
import { menuKeyboard } from '../../../helpers/keyboard'
import { auth, setStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Context, Handler } from '../../../types/context'
import { Role, TaskType } from '../../../types/models'
import { confirmNewTask } from './7-confirm'
import { CreateTaskPayload } from './8-save'

const parseCount = (text: string) => {
  const count = Number(text)
  
  if (!Number.isInteger(count) || count < 1) {
    throw new DialogPrevented()
  }

  return count
}

export const beforeInputMembersAmount = async (ctx: Context<CreateTaskPayload>) => {
  await ctx.reply(
    'Сколько человек нужно на задание?\n' +
    '(введите минимальное количество или нажмите кнопку)',
    menuKeyboard({
      [
        ctx.user.payload.type === TaskType.single ?
          'один ответственный' :
          'любое количество'
      ]: Action.create_task_input_members_amount
    })
  )

  await setStep(ctx, Action.create_task_input_members_amount)
}

export const afterInputMembersAmount: (
  Handler<Action.create_task_input_members_amount, ContextText>
) = async ctx => {
  auth(ctx, Role.leader)
  ctx.user.payload.required = parseCount(ctx.message.text)
  await confirmNewTask(ctx)
}

export const afterSkipMembersAmount: (
  Handler<Action.create_task_input_members_amount>
) = async ctx => {
  auth(ctx, Role.leader)
  await confirmNewTask(ctx)
}
