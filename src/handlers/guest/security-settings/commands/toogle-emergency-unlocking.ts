import { ContextButton } from '@jace1995/telegram-handler'
import { Handler } from '../../../../types/context'
import { Action } from '../../../../types/actions'
import { isLeader } from '../../../../helpers/user'
import { updateMenu } from '../menu'

export const toogleEmergencyUnlocking: (
  Handler<Action.toogle_force_locking, ContextButton<unknown>>
) = async ctx => {
  await ctx.api.user.update(
    ctx.user.id,
    { emergencyUnlocking: !ctx.user.emergency_unlocking }
  )

  ctx.user.emergency_unlocking = !ctx.user.emergency_unlocking
  
  await updateMenu(ctx)

  if (ctx.user.emergency_unlocking && isLeader(ctx)) {
    await ctx.reply(
      'Внимание! Если вы будете единственным лидером в вашем сообществе, ' +
      'в случае экстренной разблокировки сообщество будет удалено. ' +
      'Чтобы не допустить этой ситуации, добавьте в число лидеров запасной аккаунт, ' +
      'с помощью которого вы сможете восстановить доступ к управлению сообществом.'
    )
  }
}
