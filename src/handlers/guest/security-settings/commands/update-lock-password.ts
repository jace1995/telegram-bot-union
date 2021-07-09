import * as crypto from 'crypto'
import { ContextText } from '@jace1995/telegram-handler'
import { Action } from '../../../../types/actions'
import { Handler } from '../../../../types/context'
import { resetStep, setStep } from '../../../../helpers/user'

export const beforeInputPassword: Handler<Action.input_lock_password> = async ctx => {
  await ctx.reply(
    'Введите новый пароль разблокировки. ' +
    'С его помощью вы сможете вернуть доступ к чатботу после блокировки.'
  )
  await setStep(ctx, Action.update_lock_password, null)
}

export const afterInputPassword: (
  Handler<Action.update_lock_password, ContextText>
) = async ctx => {
  const password = ctx.message.text
  const passwordHash = crypto.createHash('md5').update(password).digest('hex')

  await ctx.api.user.update(
    ctx.user.id,
    { lockPasswordHash: passwordHash }
  )

  await ctx.reply(
    'Пароль разблокировки установлен. ' +
    'Запомните или сохраните его в надёжном месте, после этого очистите переписку с чатботом. ' +
    'Для блокировки чатбота нажмите кнопку "заблокировать".'
  )
  await resetStep(ctx)
}
