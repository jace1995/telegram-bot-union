import { resetStep } from '../../../helpers/user'
import { Context, Handler } from '../../../types/context'
import { Action } from '../../../types/actions'
import { menuKeyboard } from '../../../helpers/keyboard'
import { checkbox } from '../../../helpers/utils'
import { MessageMenu, updateMessage } from '../../../helpers/reply/update-message'
import { ContextButton } from '@jace1995/telegram-handler'
import { replyFirstInstruction } from '../../../helpers/reply/first-instruction'

const menuSettings = (ctx: Context): MessageMenu => ({
  text: 'Настройки безопасности',
  keyboard: menuKeyboard({
    [`${checkbox(ctx.user.force_locking)} экстренная блокировка`]: Action.toogle_force_locking,
    [`${checkbox(ctx.user.emergency_unlocking)} аварийная разблокировка`]: Action.toogle_emergency_unlocking,
    ['установить пароль разблокировки']: Action.input_lock_password,
    ['заблокировать']: Action.lock_account,
  })
})

export const updateMenu = (ctx: Context<unknown, ContextButton<unknown>>) => (
  updateMessage(ctx, menuSettings(ctx))
)

export const showMenu: Handler<Action.security_settings> = async ctx => {
  replyFirstInstruction(ctx, Action.security_settings)
  const menu = menuSettings(ctx)
  await ctx.reply(menu.text, menu.keyboard)
  await resetStep(ctx)
}
