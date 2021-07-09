import { ContextButton } from '@jace1995/telegram-handler'
import { MenuCommunityData } from '../../helpers/reply/menu'
import { auth, resetPayload } from '../../helpers/user'
import { Action } from '../../types/actions'
import { Handler } from '../../types/context'
import { Role } from '../../types/models'
import { beforeInputMembers } from './update-role'

export const appointVerified: (
  Handler<Action.appoint_verified, ContextButton<MenuCommunityData>>
) = async ctx => {
  const community = auth(ctx, Role.activist, ctx.data.community_id)
  await ctx.reply('Назначить проверенных')
  beforeInputMembers(
    resetPayload(ctx, { community, role: Role.verified, isLeader: false })
  )
}
