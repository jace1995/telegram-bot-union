import { ExtraEditMessage } from 'telegraf/typings/telegram-types'
import { Context } from '../../types/context'
import { User } from '../../types/models'

export const replyAlert = async (
  ctx: Context,
  membersId: User['id'] | User['id'][] | null,
  message: string,
  keyboard?: ExtraEditMessage
) => {
  if (!membersId) {
    return
  }

  const ids = Array.isArray(membersId) ? membersId : [membersId]
  const users = await ctx.api.user.availableChats(ids)
  
  await Promise.all(
    users.map(
      async user => {
        try {
          await ctx.telegram.sendMessage(user.chat, message, keyboard)
        } catch (e) {
          console.error(e)
        }
      }
    )
  )
}
