import { ContextButton } from '@jace1995/telegram-handler'
import { updateMessage } from '../../../../helpers/reply/update-message'
import { auth, setStep } from '../../../../helpers/user'
import { Action } from '../../../../types/actions'
import { Handler } from '../../../../types/context'
import { Community, Role } from '../../../../types/models'
import { selectRecipientMenu } from './keyboards'
import { ForwardDirection } from './types'

import { beforeSelectVariant } from './3-select-variant'

export interface SelectRecipientsProps {
  selected_id: Community['id'],
}

export interface SelectDirectionProps {
  direction: ForwardDirection | true,
}

export type SelectProps = Partial<SelectRecipientsProps & SelectDirectionProps>

export const updateSelection: (
  Handler<Action.forward_task_select, ContextButton<SelectProps | undefined>>
) = async ctx => {
  auth(ctx, Role.leader)

  const {
    selection,
  } = ctx.user.payload

  if (!ctx.data) {
    if (Object.values(selection).filter(community => community.selected).length) {
      await beforeSelectVariant(ctx)
    } else {
      await ctx.reply('Для продолжения нужно выбрать хотя бы одного получателя')
    }
    return
  }

  const {
    selected_id,
    direction,
  } = ctx.data

  if (selected_id) {
    selection[selected_id].selected = !selection[selected_id].selected
  }

  if (direction) {
    const communities = (
      direction === true ?
        Object.values(selection) :
        Object.values(selection).filter(community => community.direction === direction)
    )

    const selected = communities.every(community => community.selected)

    for (const community of communities) {
      community.selected = !selected
    }
  }

  await updateMessage(ctx, selectRecipientMenu(ctx.user.payload))
  await setStep(ctx, Action.forward_task_select)
}
