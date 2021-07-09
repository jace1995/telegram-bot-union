import { IndividualTaskDetails, Task, TaskProgress } from '../../../types/models'
import { ExcelData, GetStatistics, StandartRow, standartRow, userInCommunity, resultRows, standartHeader } from './types'

export interface IndividualTaskRow extends StandartRow {
  doing: Set<number>
  done: Set<number>
}

const header: Record<keyof IndividualTaskRow, string> = {
  ...standartHeader,
  doing: 'планируют участвовать',
  done: 'приняли участие',
}

export const individual2excel = async (
  getStatistics: GetStatistics<IndividualTaskRow>,
  task: Task,
): Promise<ExcelData> => {
  const participants = (task.details as IndividualTaskDetails).participants
  const membersIds = Object.keys(participants).map(Number)
  const result: IndividualTaskRow[][] = []

  await getStatistics(
    result,
    (community, taskClosed) => ({
      ...standartRow(community, taskClosed),

      doing: new Set(
        membersIds
          .filter(userId => participants[userId] === TaskProgress.doing)
          .filter(userInCommunity(community))
      ),

      done: new Set(
        membersIds
          .filter(userId => participants[userId] === TaskProgress.done)
          .filter(userInCommunity(community))
      ),
    }),
    (community, alliance) => {
      community.veriviedMembers.forEach(id => alliance.veriviedMembers.add(id))
      community.doing.forEach(id => alliance.doing.add(id))
      community.done.forEach(id => alliance.done.add(id))
      return alliance
    }
  )

  return [
    Object.values(header),
    ...resultRows(result),
  ]
}
