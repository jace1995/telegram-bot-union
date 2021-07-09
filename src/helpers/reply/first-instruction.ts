import { Action } from '../../types/actions'
import { Context } from '../../types/context'

export const replyFirstInstruction = async (
  ctx: Context,
  action: Action,
) => {
  if (!ctx.user.steps.includes(action)) {
    await ctx.reply(ctx.api.info.text(action))
    await ctx.api.user.rememberStep(ctx.user.id, action)
  }
}
