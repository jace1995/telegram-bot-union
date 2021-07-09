import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { $enum } from 'ts-enum-util'

import { auth, AuthPayload, resetPayload, setStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Context, Handler } from '../../../types/context'
import { CommunityType, Role, Task } from '../../../types/models'
import { labelsTaskTarget } from '../../../types/labels'

import { beforeInputTitle } from './3-input-title'
import { CreateTaskPayload } from './8-save'
import { replyFirstInstruction } from '../../../helpers/reply/first-instruction'

const roleTypes = $enum(Role).getValues()

export interface SelectTaskTargetPayload extends AuthPayload {
  type: CreateTaskPayload['type']
}

interface SelectTaskTargetData {
  role: CreateTaskPayload['role']
}

export const beforeSelectTaskTarget = async (
  ctx: Context<SelectTaskTargetPayload>
) => {
  await replyFirstInstruction(ctx, Action.create_task_select_target)

  await ctx.reply('Кому разослать?', inlineKeyboard(
    roleTypes.map(role => ([{
      text: labelsTaskTarget[role],
      callback_data: formatButtonData<SelectTaskTargetData>(
        Action.create_task_select_target,
        { role }
      )
    }]))
  ))
  await setStep(ctx, Action.create_task_select_target, {...ctx.user.payload})
}

export const afterSelectTaskTarget: (
  Handler<Action.create_task_select_target, ContextButton<SelectTaskTargetData>>
) = async ctx => {
  auth(ctx, Role.leader)
  
  await beforeInputTitle(
    resetPayload(ctx, {...ctx.user.payload, role: ctx.data.role})
  )
}
