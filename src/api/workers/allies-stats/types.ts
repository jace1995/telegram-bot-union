import { StatisticsResult } from '../../../types/api'
import { Community, User } from '../../../types/models'

export type ExcelData = StatisticsResult['values']

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

    if (Array.isArray(cell)) {
      return cell.join('\n')
    }

    return cell
  }))
)
