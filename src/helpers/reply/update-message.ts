import { ContextButton } from '@jace1995/telegram-handler'
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types'
import { Context } from '../../types/context'

export interface MessageMenu {
  text: string
  keyboard?: ExtraReplyMessage
}

export const updateMessage = async (ctx: Context<unknown, ContextButton<unknown>>, menu: MessageMenu) => {
  try {
    await ctx.telegram.editMessageText(
      ctx.user.chat,
      ctx.callbackQuery.message?.message_id,
      ctx.callbackQuery.inline_message_id,
      menu.text,
      menu.keyboard,
    )
  } catch (e) {
    console.error(e)
  }
}
