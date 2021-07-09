import { Api } from '../../../types/api'
import { Community, CommunityType, TaskCommunity } from '../../../types/models'

export type ParticipantsCommunities = Record<TaskCommunity['community_id'], TaskCommunity['closed']>

export const community2statistics = (
  communityId: Community['id'],
  api: Api,
  participantsCommunities: ParticipantsCommunities,
  foundedCommunitiesId: Set<Community['id']>,
  alliancesIndexes: Map<number, number>,
) => async <R extends object>(
  result: R[],
  community2row: (community: Community, taskClosed: boolean) => R,
  updateAlliance: (community: R, alliance: R) => R,
): Promise<void> => {
  if (!(communityId in participantsCommunities) || foundedCommunitiesId.has(communityId)) {
    return
  }

  foundedCommunitiesId.add(communityId)

  const community = await api.community.findById(communityId)

  const row = community2row(community, participantsCommunities[communityId])

  const rowIndex = result.length

  result.push(row)

  Array.from(alliancesIndexes).filter(([_, count]) => count).forEach(([allianceIndex]) => {
    result[allianceIndex] = updateAlliance(row, result[allianceIndex])
  })

  if (community.type === CommunityType.alliance) {
    alliancesIndexes.set(rowIndex, (alliancesIndexes.get(rowIndex) ?? 0) + 1)
  }

  await Promise.all(
    community.allies.map(
      ally => community2statistics(
        ally.id,
        api,
        participantsCommunities,
        foundedCommunitiesId,
        alliancesIndexes,
      )(
        result,
        community2row,
        updateAlliance,
      )
    )
  )

  if (community.type === CommunityType.alliance) {
    const linkCount = alliancesIndexes.get(rowIndex)
    if (linkCount) {
      alliancesIndexes.set(rowIndex, linkCount - 1)
    }
  }
}
