import { ContextText, PreventAction } from '@jace1995/telegram-handler'
import { Context } from '../types/context'
import { parseLocations } from './locations-parser'

const locationsExample = (
`Дом 1
- подъезд 1
- подъезд 2
Дом 2
- корпус 1
-- подъезд 1
-- подъезд 2
- корпус 2`
)

export const replyLocationsExample = async (ctx: Context) => {
  await ctx.reply('Отправьте список локаций в нужном формате.\nПример:\n' + locationsExample)
}

export const parseOrReplyError = async (ctx: ContextText) => {
  const locations = parseLocations(ctx.message.text)

  if (typeof locations === 'number') {
    await ctx.reply(`Ошибка формата на строке ${locations}`)
    throw new PreventAction()
  }

  return locations
}
