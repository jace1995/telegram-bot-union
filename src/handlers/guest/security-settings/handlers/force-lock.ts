import { replyAlert } from '../../../../helpers/reply/alert'
import { Context } from '../../../../types/context'
import { User } from '../../../../types/models'
import { lockMessage } from '../commands/lock-account'

export const forceLock = async (ctx: Context, leader: User) => {
  if (leader.locked || !leader.emergency_unlocking) {
    return
  }

  await ctx.api.user.update(leader.id, {
    locked: true
  })

  await replyAlert(ctx, leader.id, lockMessage)
}
