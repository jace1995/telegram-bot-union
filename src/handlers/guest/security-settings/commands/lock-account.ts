import { ContextButton } from '@jace1995/telegram-handler'
import { Handler } from '../../../../types/context'
import { Action } from '../../../../types/actions'
import { resetStep, setStep } from '../../../../helpers/user'

export const lockMessage = (
  'Чатбот заблокирован. Для разблокировки введите установленный пароль. ' +
  'Рекомендуем очистить историю сообщений.'
)

export const lockAccount: (
  Handler<Action.toogle_force_locking, ContextButton<unknown>>
) = async ctx => {
  if (!ctx.user.lock_password_hash) {
    await ctx.reply('Нужно установить пароль разблокировки')
    await setStep(ctx, Action.update_lock_password, null)
    return
  }

  await ctx.api.user.update(
    ctx.user.id,
    { locked: true }
  )
  
  await ctx.reply(lockMessage)
  await resetStep(ctx)
}
