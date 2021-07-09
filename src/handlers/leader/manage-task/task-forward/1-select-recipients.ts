import { ContextButton } from '@jace1995/telegram-handler'
import { auth, resetPayload, resetStep, setStep } from '../../../../helpers/user'
import { Action } from '../../../../types/actions'
import { Handler } from '../../../../types/context'
import { AllianceInfo, AllyInfo, CommunityType, Role } from '../../../../types/models'
import { TaskData } from '../../../member/task/common-individual-single'
import { beforeSelectVariant } from './3-select-variant'
import { selectRecipientMenu } from './keyboards'
import { ForwardDirection, ForwardTaskPayload } from './types'

const reduceSelection = (alliances: AllianceInfo[], allies: AllyInfo[]) => {
  const selection: ForwardTaskPayload['selection'] = {}

  const reducer = (direction: ForwardDirection) => (community: AllianceInfo | AllyInfo) => {
    selection[community.id] = {
      name: community.name,
      direction, 
      selected: false,
    }
  }

  alliances.forEach(reducer(ForwardDirection.up))
  allies.forEach(reducer(ForwardDirection.down))

  return selection
}

export const selectRecipients: (
  Handler<Action.forward_task, ContextButton<TaskData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.leader)

  const community = await ctx.api.community.findById(communityInfo.id)

  const payload: ForwardTaskPayload = {
    community: communityInfo,
    taskData: ctx.data,
    selection: reduceSelection(community.alliances, community.allies),
    alliancesCount: community.alliances.length,
    alliesCount: community.allies.length,
    communitiesCount: community.alliances.length + community.allies.length,
    leadersIds: community.users.leaders,
  }

  if (!payload.communitiesCount) {
    if (community.type === CommunityType.alliance) {
      await ctx.reply(
        'Некому переслать - альянс не состоит в другом альянсе и не имеет участников'
      )
    }
    else {
      await ctx.reply(
        'Некому переслать - объединение не состоит в альянсе'
      )
    }
    await resetStep(ctx)
    return
  }

  if (payload.communitiesCount === 1) {
    Object.values(payload.selection)[0].selected = true
    await beforeSelectVariant(resetPayload(ctx, payload))
    return
  }

  const menu = selectRecipientMenu(payload)

  await ctx.reply(menu.text, menu.keyboard)
  await setStep(ctx, Action.forward_task_select, payload)
}
