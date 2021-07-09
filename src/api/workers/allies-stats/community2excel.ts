import { filterMembersByAvailableRoles } from '../../../helpers/utils'
import { Api } from '../../../types/api'
import { labelsCommunityType } from '../../../types/labels'
import { Community, Role } from '../../../types/models'
import { community2statistics } from './community2statistics'
import { ExcelData, resultRows } from './types'

export interface CommunityRow {
  communityId: number
  communityName: string
  communityType: string
  veriviedMembers: Set<number>
  status: 'закрыто' | 'открыто'
  includes: string[]
}

export const header: Record<keyof CommunityRow, string> = ({
  communityId: 'id',
  communityName: 'сообщество',
  communityType: 'тип',
  veriviedMembers: 'проверенных',
  status: 'статус',
  includes: 'включает',
})

export const communityRow = (community: Community): CommunityRow => ({
  communityId: community.id,
  communityName: community.name,
  communityType: labelsCommunityType[community.type],
  veriviedMembers: new Set(
    filterMembersByAvailableRoles(community.users, Role.verified)
  ),
  status: community.closed ? 'закрыто' : 'открыто',
  includes: [],
})

export const community2excel = async (
  communityId: Community['id'],
  api: Api,
): Promise<ExcelData> => {
  const result: CommunityRow[] = []

  await community2statistics(
    communityId,
    api,
    new Set(),
    new Map(),
    result,
    communityRow,
    (community, alliance) => {
      community.veriviedMembers.forEach(id => alliance.veriviedMembers.add(id))
      alliance.includes.push(`${community.communityId}: ${community.communityName}`)
      return alliance
    }
  )

  return [
    Object.values(header),
    ...resultRows(result),
  ]
}
