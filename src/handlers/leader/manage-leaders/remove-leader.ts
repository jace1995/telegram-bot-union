import { ContextButton, ContextText } from '@jace1995/telegram-handler'
import { replyAlert } from '../../../helpers/reply/alert'
import { MenuCommunityData } from '../../../helpers/reply/menu'
import { auth, forAlliance, resetStep, setStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'

export const beforeInputLeaderId: (
  Handler<Action.remove_leader, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = forAlliance(auth(ctx, Role.leader))
  await ctx.reply(
    'Введите идентификатор лидера, ' +
    'которого нужно исключить'
  )
  await setStep(ctx, Action.remove_leader_after_input_id, { community: communityInfo })
}

export const afterInputLeaderId: (
  Handler<Action.remove_leader_after_input_id, ContextText>
) = async ctx => {
  const communityInfo = forAlliance(auth(ctx, Role.leader))
  const leaderId = Number(ctx.message.text)

  if (!Number.isInteger(leaderId)) {
    await ctx.reply('Неправильный идентификатор, проверьте внимательнее и попробуйте снова')
    return
  }

  const alliance = await ctx.api.community.findById(communityInfo.id)
  const leaders = alliance.users.leaders

  if (!leaders.some(leaderId => leaderId === leaderId)) {
    await ctx.reply('Пользователь не найден')
    return
  }

  await ctx.api.member.changeRole({
    communityId: alliance.id,
    role: Role.member,
    membersIds: [leaderId],
  })
  
  await replyAlert(
    ctx,
    leaders,
    (
      `Лидер ${ctx.user.id} ` +
      `исключил лидера ${leaderId} ` +
      `из альянса ${alliance.name}`
    )
  )

  await resetStep(ctx)
}
