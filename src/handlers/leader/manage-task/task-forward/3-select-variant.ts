import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { auth, setStep } from '../../../../helpers/user'
import { Action } from '../../../../types/actions'
import { Context, Handler } from '../../../../types/context'
import { Role } from '../../../../types/models'
import { ForwardMethod, ForwardTaskPayload } from './types'

import { forwardRequest } from './4-forward-request'

export const beforeSelectVariant = async (ctx: Context<ForwardTaskPayload>) => {
  await ctx.reply(
    'Создать копию или отправить оригинал?',
    inlineKeyboard([
      [{
        text: 'копия',
        callback_data: formatButtonData<ForwardMethod>(
          Action.forward_task_choice_variant,
          ForwardMethod.copy
        ),
      }],
      [{
        text: 'оригинал',
        callback_data: formatButtonData<ForwardMethod>(
          Action.forward_task_choice_variant,
          ForwardMethod.original
        ),
      }]
    ])
  )
  await setStep(ctx, Action.forward_task_choice_variant)
}

export const afterSelectVariant: (
  Handler<Action.forward_task_choice_variant, ContextButton<ForwardMethod>>
) = async ctx => {
  auth(ctx, Role.leader)
  await forwardRequest(ctx, ctx.data)
}
