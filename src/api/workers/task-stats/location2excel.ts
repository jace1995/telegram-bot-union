import {
  LocationTaskDetails, Task, UnionLocation, isLocationCategory, TaskProgress, Community
} from '../../../types/models'

import {
  ExcelData, GetStatistics, StandartRow, resultRows, standartHeader, standartRow
} from './types'

export interface LocationTaskRow extends StandartRow {
  progress: number
}

const header: Record<keyof LocationTaskRow, string> = {
  ...standartHeader,
  progress: 'прогресс (%)',
}

type ProgressMap = Map<Community['id'], number>
const keyProgressMap = Symbol('ProgressMap')

const locations2progress = (
  location: UnionLocation['locations'] | undefined,
  prefix: string
): number => {
  if (!location) {
    return 0
  }

  const pattern = new RegExp(`^${prefix}\\d+\\.$`)
  const percents: number[] = []

  Object.entries(location).filter(([id]) => pattern.test(id)).forEach(([id, sublocation]) => {
    percents.push(
      isLocationCategory(sublocation) ?
        locations2progress(location, id) :
        (sublocation.participant?.progress === TaskProgress.done ? 1 : 0)
    )
  })
  
  return percents.reduce((sum, p) => sum + p, 0) / percents.length
}

export const location2excel = async (
  getStatistics: GetStatistics<LocationTaskRow>,
  task: Task,
): Promise<ExcelData> => {
  const locations = (task.details as LocationTaskDetails).locations
  const result: LocationTaskDetails[][] = []

  await getStatistics(
    result,
    (community, taskClosed) => ({
      ...standartRow(community, taskClosed),
      progress: Math.trunc(
        locations2progress(locations[community.id], '') * 100
      ),
    }),
    (community, alliance) => {
      const map: ProgressMap = alliance[keyProgressMap] ?? new Map()
      
      map.set(community.communityId, community.progress)

      alliance[keyProgressMap] = map

      alliance.progress = Math.trunc(
        Array.from(map).reduce(
          (sum, [id, progress]) => sum + progress, 0
        ) / map.size
      )

      return alliance
    }
  )

  return [
    Object.values(header),
    ...resultRows(result),
  ]
}
