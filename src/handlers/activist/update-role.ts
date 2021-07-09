import { ContextText } from '@jace1995/telegram-handler'
import { replyAlert } from '../../helpers/reply/alert'
import { menu } from '../../helpers/reply/menu'

import { auth, AuthPayload, resetStep, setStep } from '../../helpers/user'
import { validID } from '../../helpers/utils'
import { Action } from '../../types/actions'
import { Context, Handler } from '../../types/context'
import { labelsRole } from '../../types/labels'
import { CommunityInfo, Role, User } from '../../types/models'
import { forceLock } from '../guest/security-settings/handlers/force-lock'

export interface InputMembersPayload extends AuthPayload {
  role: Role
}

export const updateRole = async (
  ctx: Context,
  membersIds: User['id'][],
  communityInfo: CommunityInfo,
  newRole: Role
) => {
  if (!membersIds.length) {
    return
  }
  
  const role = newRole

  await ctx.api.member.changeRole({
    communityId: communityInfo.id,
    membersIds,
    role,
  })
  
  await ctx.reply('Новая роль установлена')

  // разослать уведомления участникам

  await replyAlert(
    ctx,
    membersIds,
    `Вам назначена роль "${labelsRole[role]}" в сообществе "${communityInfo.name}"`
  )

  const roleMenu = menu({
    ...communityInfo,
    role,
  })

  if (roleMenu) {
    await replyAlert(ctx, membersIds, ...roleMenu)
  }
  
  // аварийная блокировка лидеров, если требуется
  if (newRole !== Role.leader) {
    const blockingLeaders = await ctx.api.member.leadersForBlock({
      communityId: communityInfo.id,
      leaderIds: membersIds,
    })

    if (blockingLeaders.length) {
      await Promise.all(
        blockingLeaders.map(
          async leader => {
            try {
              await forceLock(ctx, leader)
            } catch (e) {
              console.error(e)
            }
          }
        )
      )
    }
  }
}

export const beforeInputMembers = async (ctx: Context<InputMembersPayload>) => {
  await ctx.reply('Введите идентификаторы участников, которым нужно изменить роль')
  await setStep(ctx, Action.update_role_input_members)
}

export const afterInputMembers: (
  Handler<Action.update_role_input_members, ContextText>
) = async ctx => {
  const communityInfo = auth(ctx, Role.activist)
  const membersIds = ctx.message.text.split(/\s+/).filter(v => v).map(Number)

  if (!membersIds.every(id => validID(id))) {
    await ctx.reply(
      'Неправильный формат.\n' +
      'Нужно вводить идентификаторы участников, разделляемые пробелом или переносом строки.\n' +
      'Пример: "1234567890 0987654321"'
    )
    return
  }

  const community = await ctx.api.community.findById(communityInfo.id)
  
  const foundMembersIds = community.users.all.filter(
    memberId => membersIds.includes(memberId)
  )

  // никто не найден
  if (!foundMembersIds.length) {
    await ctx.reply(
      membersIds.length === 1 ?
        'Участник не найден' :
        'Участники не найдены'
    )
    return
  }

  // попытка изменить свою роль единственным лидером
  if (
    communityInfo.role === Role.leader &&
    community.users.leaders.length === 1 &&
    foundMembersIds.some(memberId => memberId === ctx.user.id)
  ) {
    await ctx.reply('Вы не можете изменить свою роль, пока вы единственный лидер сообщества')
    return
  }

  // не все найдены
  if (foundMembersIds.length < membersIds.length) {
    await ctx.reply(
      'Не найдены участники: ' +
      membersIds.filter(id => foundMembersIds.every(memberId => memberId !== id)).join(', ') + (
        foundMembersIds.length ?
          '\nВы можете назначить роль для следующих участников: ' :
          ''
      )
    )

    if (foundMembersIds.length) {
      await ctx.reply(foundMembersIds.join(' '))
    }

    return
  }

  await updateRole(ctx, foundMembersIds, communityInfo, ctx.user.payload.role)  
  await resetStep(ctx)
}
