import { ContextCommand } from '@jace1995/telegram-handler'
import { resetStep } from '../../helpers/user'
import { Action } from '../../types/actions'
import { Handler } from '../../types/context'

export const info: Handler<Action.info, ContextCommand> = async ctx => {
  await ctx.reply('Здесь будут инструкции, обещаем :)')
  await resetStep(ctx)
}
