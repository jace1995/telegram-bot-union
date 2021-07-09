import { parentPort, workerData } from 'worker_threads'

import { StatisticsTaskInputData, StatisticsResult } from '../../../types/api'
import { Task, TaskType } from '../../../types/models'
import { api as connectApi } from '../..'

import { community2statistics } from './community2statistics'
import { single2excel } from './single2excel'
import { individual2excel } from './individual2excel'
import { location2excel } from './location2excel'
import { ExcelData, GetStatistics } from './types'

const task2excel = (getStatistics: GetStatistics<any>, task: Task): Promise<ExcelData> => {
  switch (task.type) {
    case TaskType.single:
      return  single2excel(getStatistics, task)

    case TaskType.individual:
      return  individual2excel(getStatistics, task)

    case TaskType.location:
      return  location2excel(getStatistics, task)
  }
}

export const start = async (data: StatisticsTaskInputData) => {
  try {
    const api = await connectApi()

    const [task, assignsList] = await Promise.all([
      api.task.findById(data.taskId),
      api.task.assignsList(data.taskId),
    ])

    const getStatistics = community2statistics(
      data.communityId, api, 
      assignsList.reduce((map, assign) => {
        map[assign.community_id] = assign.closed
        return map
      }, {}),
      new Set(), new Map(),
    )

    const result: StatisticsResult = {
      filename: `${task.title}.xlsx`,
      values: await task2excel(getStatistics, task),
    }
    
    return result
  }
  catch (e) {
    console.error('statistics worker')
    console.error(e)
    return undefined
  }
}


if (workerData) {
  start(workerData.data)
    .then(result => {
      parentPort?.postMessage(result)
      process.exit()
    })
    .catch(console.error)
}
