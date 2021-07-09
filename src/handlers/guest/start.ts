import { resetStep } from '../../helpers/user'
import { Handler } from '../../types/context'
import { Action } from '../../types/actions'
import { replyFirstInstruction } from '../../helpers/reply/first-instruction'
import { menuStart } from '../../helpers/reply/menu'

export const start: Handler<Action.start> = async ctx => {
  await replyFirstInstruction(ctx, Action.start)
  await ctx.reply(...menuStart(ctx.user.id))
  await resetStep(ctx)
}
