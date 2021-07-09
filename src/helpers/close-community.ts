import { Context } from '../types/context'
import { Community } from '../types/models'
import { replyAlert } from './reply/alert'

export const closeCommunities = async (
  ctx: Context,
  communityIds: Community['id'] | Community['id'][]
) => {
  const communities = await ctx.api.community.close(communityIds)

  await Promise.all(
    communities.map(community => (
      replyAlert(
        ctx,
        community.users.all,
        `Закрыто сообщество "${community.name}" (${community.id})`,
      )
    ))
  )
}
