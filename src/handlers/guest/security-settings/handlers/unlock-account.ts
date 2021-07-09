import * as crypto from 'crypto'
import { Context } from '../../../../types/context'
import { closeCommunities } from '../../../../helpers/close-community'
import { start } from '../../start'

const emergencyUnlockPhrase = 'аварийная разблокировка'

const unlockTooltip = (
  '🔐 Аккаунт заблокирован. Вы можете вернуть аккаунт с помощью аварийной разблокировки, ' +
  `для этого введите вразу "${emergencyUnlockPhrase}", ` +
  'в этом случае будут удалены все ваши персональные данные.'
)

const execEmergencyUnlock = async (ctx: Context) => {
  const userId = ctx.user.id

  const lastLeaderIn = await ctx.api.member.lastLeaderCommunities(userId)

  if (lastLeaderIn.length) {
    await closeCommunities(ctx, lastLeaderIn)
  }

  await ctx.api.member.leaveAllCommunities(userId)
  await ctx.api.user.clearSettings(userId)

  ctx.user.steps = []
}

const emergencyUnlock = async (ctx: Context) => {
  await execEmergencyUnlock(ctx)
  await start(ctx)
}

export const tryUnlockAccount = async (ctx: Context) => {
  const password = ctx.message?.text

  if (!password) {
    await ctx.reply(unlockTooltip)
    return
  }

  if (password === emergencyUnlockPhrase) {
    await emergencyUnlock(ctx)
    return 
  }

  const passwordHash = crypto.createHash('md5').update(password).digest('hex')

  if (ctx.user.lock_password_hash === passwordHash) {
    await ctx.api.user.update(ctx.user.id, {
      locked: false
    })
    await start(ctx)
    return
  }

  if (ctx.user.emergency_unlocking) {
    await emergencyUnlock(ctx)
    return
  }

  await ctx.reply(unlockTooltip)
}
