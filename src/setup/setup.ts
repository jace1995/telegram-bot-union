import {
  connectPostgresDB, clearDatabase,
  createEnumType, createSequence, createTable, pk,
} from '@jace1995/postgres-helpers'

import { Action } from '../types/actions'
import { Role, CommunityType, TaskType, locationsSequenceKey, IdProvider, t } from '../types/models'

import { Enums } from './types'
import { createUserTable } from './tables/user'
import { createCommunityTable } from './tables/community'
import { createTaskTable } from './tables/task'
import { createTaskCommunityTable } from './tables/task-community'
import { createAllianceTable } from './tables/alliance'
import { createInvitationTable } from './tables/invitation'
import { createTaskWaitAssignTable } from './tables/task-wait-assign'
import { createMemberTable } from './tables/member'

const setup = async () => {
  const db = await connectPostgresDB()

  await db.setup(
    clearDatabase(),

    createSequence(locationsSequenceKey),

    createEnumType(Enums.action, Action),
    createEnumType(Enums.role, Role),
    createEnumType(Enums.community_type, CommunityType),
    createEnumType(Enums.task_type, TaskType),

    createTable<IdProvider>(t.user_ids, {
      id: pk(),
    }),
    createUserTable,
    createCommunityTable,
    createMemberTable,
    createTaskTable,
    createTaskCommunityTable,
    createAllianceTable,
    createInvitationTable,
    createTaskWaitAssignTable,
  )

  console.log('Setup done ✅')
}

setup()
