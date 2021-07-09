import { createTable, column } from '@jace1995/postgres-helpers'
import { t, TaskWaitAssign } from '../../types/models'
import { types } from '../types'

export const createTaskWaitAssignTable = createTable<TaskWaitAssign>(t.task_wait_assign, {
  task_id: column(types.pkTaskFK),
  from_id: column(types.pkCommunityFK),
  to_id: column(types.pkCommunityFK),
})
