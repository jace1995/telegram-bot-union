import { Api } from '../../../types/api'
import { Community, CommunityType } from '../../../types/models'
import { CommunityRow } from './community2excel'

export const community2statistics = async (
  communityId: Community['id'],
  api: Api,
  foundedCommunitiesId: Set<Community['id']>,
  alliancesIndexes: Map<number, number>,
  result: CommunityRow[],
  community2row: (community: Community) => CommunityRow,
  updateAlliance: (community: CommunityRow, alliance: CommunityRow) => CommunityRow,
): Promise<void> => {
  if (foundedCommunitiesId.has(communityId)) {
    return
  }

  foundedCommunitiesId.add(communityId)

  const community = await api.community.findById(communityId)

  const row = community2row(community)

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
        foundedCommunitiesId,
        alliancesIndexes,
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
