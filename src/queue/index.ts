import { isMaster } from 'cluster'

import { startSocketMicroservice } from '@jace1995/microservice'

import { connectPostgresDB } from '@jace1995/postgres-helpers'
import { loadPropertyOptional } from '@jace1995/load-config'

import { handle } from './handler'
import { Queue } from './context'
import { queuePort } from './types'

export const startQueueMicroservice = async () => {
  if (isMaster) {
    const pg = await connectPostgresDB({
      log: loadPropertyOptional('SQL_LOG') === 'enable'
    })

    const queue = new Queue()
  
    return await startSocketMicroservice(queuePort, async data => (
      JSON.stringify(
        await handle({
          pg,
          event: JSON.parse(data),
          queue,
        })
      )
    ))
  }

  return undefined
}
