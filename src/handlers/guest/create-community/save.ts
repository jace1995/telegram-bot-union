import { CommunityType, Role } from '../../../types/models'
import { NewCommunity } from '../../../types/api'
import { resetStep } from '../../../helpers/user'
import { Context } from '../../../types/context'
import { menu } from '../../../helpers/reply/menu'

export interface CreateCommunityPayload extends NewCommunity {}

const completeMessage = (type: CommunityType): string => {
  switch (type) {
    case (CommunityType.alliance):
      return `Альянс создан`
    case (CommunityType.union):
      return `Объединение создано`
  }
  throw new Error('unknown value: ' + type)
}

export const saveNewCommunity = async (ctx: Context<CreateCommunityPayload>) => {
  const community = ctx.user.payload
  const communityId = await ctx.api.community.create(ctx.user.payload)

  await ctx.api.member.joinCommunity({
    user_id: ctx.user.id,
    community_id: communityId,
    role: Role.leader,
  })

  await ctx.reply(
    completeMessage(community.type)
  )

  await ctx.reply(...menu({...community, id: communityId, role: Role.leader}))
  await resetStep(ctx)
}
