import { formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { Action } from '../../../../types/actions'
import { CommunityForSelect, ForwardDirection, ForwardTaskPayload } from './types'
import { SelectDirectionProps, SelectRecipientsProps } from './2-update-selection'
import { CommunityType } from '../../../../types/models'
import { InlineKeyboardButton } from 'telegraf/typings/telegram-types'
import { MessageMenu } from '../../../../helpers/reply/update-message'

const formCommunityMessage = (community: CommunityForSelect) => (
  (community.selected ? '✅ ': '☑️ ') +
  ((): string => {
    switch (community.direction) {
      case ForwardDirection.up:
        return '⬆️ '

      case ForwardDirection.down:
        return '⬇️ '
    }
  })() +
  community.name
)

const toEachButton: InlineKeyboardButton[] = [{
  text: 'всем',
  callback_data: formatButtonData<SelectDirectionProps>(
    Action.forward_task_select,
    { direction: true }
  )
}]

const manageButtons = (data: ForwardTaskPayload): InlineKeyboardButton[] => {
  switch (data.community.type) {
    case CommunityType.union:
      return toEachButton

    case CommunityType.alliance:
      return data.alliancesCount && data.alliesCount ? [
        ...(
          data.alliancesCount ? [{
            text: '⬆️',
            callback_data: formatButtonData<SelectDirectionProps>(
              Action.forward_task_select,
              { direction: ForwardDirection.up }
            )
          }] : []
        ),
        {
          text: '⬆️⬇️',
          callback_data: formatButtonData<SelectDirectionProps>(
              Action.forward_task_select,
              { direction: true }
            )
        },
        ...(
          data.alliesCount ? [{
            text: '⬇️',
            callback_data: formatButtonData<SelectDirectionProps>(
              Action.forward_task_select,
              { direction: ForwardDirection.down }
            )
          }] : []
        ),
      ] : toEachButton
  }
}

const selectionButtons = (data: ForwardTaskPayload): InlineKeyboardButton[][] => (
  Object.entries(data.selection).map(([id, community]) => ([{
    text: formCommunityMessage(community),
    callback_data: formatButtonData<SelectRecipientsProps>(
      Action.forward_task_select,
      { selected_id: Number(id) }
    )
  }]))
)

const selectRecipientsKeyboard = (data: ForwardTaskPayload) => (
  inlineKeyboard([
    manageButtons(data),
    ...selectionButtons(data),
    [{
      text: 'Готово',
      callback_data: Action.forward_task_select,
    }]
  ])
)

export const selectRecipientMenu = (payload: ForwardTaskPayload): MessageMenu => ({
  text: 'Выберите сообщества',
  keyboard: selectRecipientsKeyboard(payload),
})
