import { SingleTaskDetails, Task, TaskProgress, TaskQueue } from '../../../types/models'
import { ExcelData, GetStatistics, resultRows, StandartRow, standartHeader, standartRow, userInCommunity } from './types'

export interface SingleTaskRow extends StandartRow {
  waiting: Set<number>
  doing: Set<number>
}

const header: Record<keyof SingleTaskRow, string> = {
  ...standartHeader,
  waiting: 'в очереди',
  doing: 'участвуют',
}

export const single2excel = async (
  getStatistics: GetStatistics<SingleTaskRow>,
  task: Task,
): Promise<ExcelData> => {
  const participants = (task.details as SingleTaskDetails).participants
  const membersIds = Object.keys(participants).map(Number)
  const result: SingleTaskDetails[][] = []

  await getStatistics(
    result,
    (community, taskClosed) => ({
      ...standartRow(community, taskClosed),

      waiting: new Set(
        membersIds
          .filter(userId => participants[userId] === TaskQueue.wait)
          .filter(userInCommunity(community))
      ),

      doing: new Set(
        membersIds
          .filter(userId => participants[userId] === TaskProgress.doing)
          .filter(userInCommunity(community))
      ),
    }),
    (community, alliance) => {
      community.veriviedMembers.forEach(id => alliance.veriviedMembers.add(id))
      community.waiting.forEach(id => alliance.waiting.add(id))
      community.doing.forEach(id => alliance.doing.add(id))
      return alliance
    }
  )

  return [
    Object.values(header),
    ...resultRows(result),
  ]
}
