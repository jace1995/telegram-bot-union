import { $enum } from 'ts-enum-util'
import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'

import { Role } from '../../types/models'
import { Action } from '../../types/actions'
import { resetPayload, auth, forUnion, setStep } from '../../helpers/user'
import { replyFirstInstruction } from '../../helpers/reply/first-instruction'
import { MenuCommunityData } from '../../helpers/reply/menu'
import { beforeInputMembers } from '../activist/update-role'
import { labelsRole } from '../../types/labels'
import { Handler } from '../../types/context'

const roles = $enum(Role).getValues()

interface SelectRoleData {
  role: Role
}

export const beforeSelectRole: (
  Handler<Action.manage_role, ContextButton<MenuCommunityData>>
) = async ctx => {
  const communityInfo = forUnion(auth(ctx, Role.leader))

  await ctx.reply('Управление ролями')

  await replyFirstInstruction(ctx, Action.manage_role)

  await ctx.reply('Выберите роль, которую хотите назначить', inlineKeyboard(
    roles.map(role => ([{
      text: labelsRole[role],
      callback_data: formatButtonData<SelectRoleData>(
        Action.manage_role_select_role,
        { role }
      )
    }]))
  ))

  await setStep(ctx, Action.manage_role_select_role, { community: communityInfo })
}

export const afterSelectRole: (
  Handler<Action.manage_role_select_role, ContextButton<SelectRoleData>>
) = async ctx => {
  const community = forUnion(auth(ctx, Role.leader))
  const role = ctx.data.role

  if (!roles.includes(role)) {
    throw new Error('unknown role: ' + role)
  }

  await ctx.reply(labelsRole[role])
  await beforeInputMembers(
    resetPayload(ctx, { community, role, isLeader: true })
  )
}
