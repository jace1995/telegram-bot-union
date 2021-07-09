import { formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { Action } from '../../../../types/actions'
import { Context } from '../../../../types/context'
import { Community, CommunityInfo, Task } from '../../../../types/models'
import { TaskData } from '../../../member/task/common-individual-single'
import { ForwardMethod } from './types'

const menu: Record<string, Action> = {
  ['принять']: Action.accept_task,
  ['отклонить']: Action.decline_task,
}

export const replyAlertLeaders = async (
  ctx: Context,
  recipients: Community[],
  task: Task,
  sender: CommunityInfo,
  forwardMethod: ForwardMethod,
) => {
  await Promise.all(
    recipients.map(
      async recipient => {
        const users = await ctx.api.user.availableChats(recipient.users.leaders)

        await Promise.all (
          users.map(
            async user => {

              const data = [
                task.id,
                sender.id,
                recipient.id,
                forwardMethod
              ]

              const keyboard = inlineKeyboard([
                [{
                  text: 'подробнее',
                  callback_data: formatButtonData<TaskData>(Action.task_apply_info, {
                    task_id: task.id,
                    community_id: sender.id,
                  }),
                }],
                ...Object.entries(menu).map(([text, action]) => ([{
                  text,
                  callback_data: formatButtonData(action, data),
                }]))
              ])

              const message = `Сообщество "${sender.name}" поделилось заданием: "${task.title}"`

              try {
                await ctx.telegram.sendMessage(user.chat, message, keyboard)
              } catch (e) {
                console.error(e)
              }
            }
          )
        )
      }
    )
  )
}
