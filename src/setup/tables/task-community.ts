import { createTable, column, pgType } from '@jace1995/postgres-helpers'
import { t, TaskCommunity } from '../../types/models'
import { types } from '../types'

export const createTaskCommunityTable = createTable<TaskCommunity>(t.task_community, {
  task_id: column(types.pkTaskFK),
  community_id: column(types.pkCommunityFK),
  closed: column({
    type: pgType.boolean,
    default: false,
  }),
})
