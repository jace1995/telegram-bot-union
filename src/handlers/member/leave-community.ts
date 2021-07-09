import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { closeCommunities } from '../../helpers/close-community'
import { confirmButton, menuKeyboard } from '../../helpers/keyboard'
import { replyAlert } from '../../helpers/reply/alert'
import { MenuCommunityData } from '../../helpers/reply/menu'
import { auth, resetStep } from '../../helpers/user'
import { Action } from '../../types/actions'
import { Handler } from '../../types/context'
import { Role } from '../../types/models'

export const leave: (
  Handler<Action.leave_community, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.member)

  if (communityInfo.role !== Role.member) {
    await ctx.reply(
      (
        (
          communityInfo.role === Role.leader &&
          await ctx.api.member.isLastLeader({
            communityId: communityInfo.id,
            leaderId: ctx.user.id,
          })
        ) ? // последний лидер в сообществе
          (
            'Внимание! Сообщество будет удалено, поскольку не останется лидеров, ' +
            'способных создавать задачи или добавлять новых лидеров.\n\n' +
            'Вы действительно хотите удалить сообщество?'
          ) :
          (
            'Вы действительно хотите покинуть сообщество? ' +
            'Назначенная роль будет потеряна, вы сможете вернуться в роли "участник"'
          )
      ),
      confirmButton<MenuCommunityData>(
        Action.confirm_leave_community,
        { community_id: communityInfo.id }
      )
    )
    await ctx.api.user.setStep(ctx.user.id, Action.confirm_leave_community, null)
    return
  }

  await afterConfirm(ctx)
}

export const afterConfirm: (
  Handler<Action.confirm_leave_community, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = auth(ctx, Role.member)

  // последний лидер в сообществе
  if (
    communityInfo.role === Role.leader &&
    await ctx.api.member.isLastLeader({
      communityId: communityInfo.id,
      leaderId: ctx.user.id,
    })
  ) {
    await closeCommunities(ctx, communityInfo.id)
  }
  else {
    await ctx.api.member.leaveCommunity({
      userId: ctx.user.id,
      communityId: communityInfo.id,
    })

    await ctx.reply(`Вы вышли из сообщества "${communityInfo.name}"`)
  }
  
  await resetStep(ctx)
}
