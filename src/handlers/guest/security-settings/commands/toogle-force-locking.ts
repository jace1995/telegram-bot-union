import { ContextButton } from '@jace1995/telegram-handler'
import { Handler } from '../../../../types/context'
import { Action } from '../../../../types/actions'
import { updateMenu } from '../menu'

export const toogleForceLocking: (
  Handler<Action.toogle_force_locking, ContextButton<unknown>>
) = async ctx => {
  if (!ctx.user.lock_password_hash) {
    await ctx.reply('Нужно установить пароль блокировки')
    return
  }
  
  await ctx.api.user.update(
    ctx.user.id,
    { forceLocking: !ctx.user.force_locking }
  )
  
  ctx.user.force_locking = !ctx.user.force_locking
  
  await updateMenu(ctx)
}
