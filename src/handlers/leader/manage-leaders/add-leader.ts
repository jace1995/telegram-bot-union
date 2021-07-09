import { ContextButton, ContextText } from '@jace1995/telegram-handler'
import { replyAlert } from '../../../helpers/reply/alert'
import { replyFirstInstruction } from '../../../helpers/reply/first-instruction'
import { MenuCommunityData } from '../../../helpers/reply/menu'
import { auth, forAlliance, resetStep, setStep } from '../../../helpers/user'
import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { Role } from '../../../types/models'

export const beforeInputLeaderId: (
  Handler<Action.add_leader, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = forAlliance(auth(ctx, Role.leader))
  await replyFirstInstruction(ctx, Action.add_leader)
  await ctx.reply('Введите идентификатор человека, которого нужно назначить лидером')
  await setStep(ctx, Action.add_leader_after_input_id, { community: communityInfo })
}

export const afterInputLeaderId: (
  Handler<Action.add_leader_after_input_id, ContextText>
) = async ctx => {
  forAlliance(auth(ctx, Role.leader))

  const leaderId = Number(ctx.message.text)

  // !!! todo repeated code
  if (!Number.isInteger(leaderId) || leaderId === ctx.user.id) {
    await ctx.reply('Неправильный идентификатор, проверьте внимательнее и попробуйте снова')
    return
  }

  const alliance = await ctx.api.community.findById(ctx.user.payload.community.id)
  const leaders = alliance.users.leaders

  const user = await ctx.api.user.findById(leaderId)

  if (alliance.users.all.some(memberId => memberId === leaderId)) {
    await ctx.reply('Пользователь не найден')
    return
  }

  if (leaders) {
    await ctx.reply('Этот пользователь уже лидер')
    return
  }

  await ctx.api.member.changeRole({
    communityId: alliance.id,
    role: Role.leader,
    membersIds: [leaderId],
  })
  await replyAlert(
    ctx,
    leaders,
    (
      `Лидер ${ctx.user.id} ` +
      `назначил пользователя ${leaderId} ` +
      `новым лидером в альянсе ${alliance.name}`
    )
  )
  await resetStep(ctx)
}
