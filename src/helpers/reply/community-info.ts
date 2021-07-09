import { Context } from '../../types/context'
import { labelsCommunityType, labelsRole } from '../../types/labels'
import { Community, Member } from '../../types/models'

export interface CommunityLabelProps {
  id: Community['id']
  type: Community['type']
  name: Community['name']
  closed?: Community['closed']
  role?: Member['role']
}

export const communityLabel = (community: CommunityLabelProps) => (
  (community.closed ? '⛔ ЗАКРЫТО ⛔\n' : '') +
  `${labelsCommunityType[community.type]} "${community.name}"\n` +
  `Идентификатор: ${community.id}` +
  (community.role ? `\nВаша роль: ${labelsRole[community.role]}` : '')
)

export const replyCommunityInfo = async(ctx: Context, community: Community) => {
  const text = (
    communityLabel(community) +
    (community.description ? '\n\n' + community.description : '')
  )

  if (community.image) {
    await ctx.replyWithPhoto(community.image, { caption: text })
  } else {
    await ctx.reply(text)
  }
}
