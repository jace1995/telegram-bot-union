import { loadPropertyOptional } from '@jace1995/load-config'
import { startTelegramBot } from '@jace1995/telegram-handler'
import { api } from './api'
import { tryUnlockAccount } from './handlers/guest/security-settings/handlers/unlock-account'
import { startQueueMicroservice } from './queue'
import { Context } from './types/context'
import { handlers } from './types/handlers'

export const start = async () => {
  await startQueueMicroservice()
  await startTelegramBot({
    api: await api(),
    handlers,
    errorMessage: 'Упс, произошла ошибка 🤷‍♀️',
    webhook: loadPropertyOptional('TELEGRAM_WEBHOOK_DOMAIN'),
    onAuth: async (ctx, errorHandler) => {
      try {
        if (!ctx.user.locked) {
          return true
        }

        await tryUnlockAccount(ctx as Context)
        return false
      }
      catch (e) {
        errorHandler(e)
        return false
      }
    },
  })
}
