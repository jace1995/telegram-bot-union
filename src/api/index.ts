import { loadPropertyOptional } from '@jace1995/load-config'
import { connectPostgresDB } from '@jace1995/postgres-helpers'
import { Api } from '../types/api'

import { connectMicroserviceSocket } from '@jace1995/microservice'

import { auth } from './auth'
import { UserApi } from './user'
import { CommunityApi } from './community'
import { MemberApi } from './member'
import { TaskApi } from './task'
import { AllianceApi } from './alliance'
import { LocationsApi } from './locations'
import { InfoApi } from './info'
import { queuePort } from '../queue/types'
import { Queue } from './utils'

export const api = async (): Promise<Api> => {
  const pg = await connectPostgresDB({
    log: loadPropertyOptional('SQL_LOG') === 'enable'
  })

  const queue = new Queue(
    await connectMicroserviceSocket(queuePort)
  )

  return {
    auth: (chatID: number) => auth(pg, chatID),
    info: new InfoApi(),
    user: new UserApi(pg),
    community: new CommunityApi(pg),
    locations: new LocationsApi(pg),
    alliance: new AllianceApi(pg, queue),
    member: new MemberApi(pg, queue),
    task: new TaskApi(pg, queue),
  }
}
