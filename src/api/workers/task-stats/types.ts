import { filterMembersByAvailableRoles } from '../../../helpers/utils'
import { StatisticsResult } from '../../../types/api'
import { labelsCommunityType } from '../../../types/labels'
import { Community, Role, User } from '../../../types/models'

export type ExcelData = StatisticsResult['values']

export type GetStatistics<R extends object> = (
  result: object[],
  community2row: (community: Community, active: boolean) => R,
  updateAlliance: (community: R, alliance: R) => R,
) => Promise<void>

export interface StandartRow {
  communityId: Community['id']
  communityName: Community['name']
  communityType: string
  veriviedMembers: Set<number>
  taskClosed: 'завершено' | 'активно'
}

export const standartHeader: Record<keyof StandartRow, string> = ({
  communityId: 'id',
  communityName: 'сообщество',
  communityType: 'тип',
  veriviedMembers: 'проверенных',
  taskClosed: 'статус',
})

export const standartRow = (community: Community, closed: boolean): StandartRow => ({
  communityId: community.id,
  communityName: community.name,
  communityType: labelsCommunityType[community.type],
  veriviedMembers: new Set(
    filterMembersByAvailableRoles(community.users, Role.verified)
  ),
  taskClosed: closed ? 'завершено' : 'активно',
})

export const userInCommunity = (community: Community) => (userId: User['id']) => (
  community.users.all.some(memberId => memberId === userId)
)

export const resultRows = <R>(result: R[]) => (
  result.map(row => Object.values(row).map(cell => {
    if (cell instanceof Set) {
      return cell.size
    }

    if (typeof cell === 'boolean') {
      return cell ? 'да' : 'нет'
    }

    return cell
  }))
)
