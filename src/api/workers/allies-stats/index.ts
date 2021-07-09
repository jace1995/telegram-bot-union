import { parentPort, workerData } from 'worker_threads'

import { StatisticsResult } from '../../../types/api'
import { StatisticsAlliesInputData } from '../../../types/api'
import { api as connectApi } from '../..'

import { community2excel } from './community2excel'

export const start = async (data: StatisticsAlliesInputData) => {
  try {
    const api = await connectApi()

    const values = await community2excel(data.communityId, api)

    const result: StatisticsResult = {
      filename: `${data.communityName}.xlsx`,
      values,
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
