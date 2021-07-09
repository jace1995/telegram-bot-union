import {
  createTable,
  column,
  pgType,
  pk,
  columnAutoupdate,
  COUNT,
  full,
} from '@jace1995/postgres-helpers'

import { dependency, join } from '@jace1995/postgres-helpers/build/types'

import { CommunityType, t, Task, TaskCommunity, TaskUnionsCounter } from '../../types/models'
import { Enums, types } from '../types'

export const createTaskTable = createTable<Task>(t.task, {
  id: pk(),
  type: column({
    type: Enums.task_type,
    readonly: true,
  }),
  title: column(pgType.varchar(types.length.taskName)),
  role: column(pgType.custom(Enums.role)),
  details: column(pgType.jsonb),
  unions: columnAutoupdate<TaskCommunity, TaskUnionsCounter>({
    select: {
      table: t.task_community,
      columns: {
        [t.task_union_counter.count]: COUNT(),
      },
      join: join({
        table: t.community,
        on: `${full(t.community).id} = ${full(t.task_community).community_id}`,
      }),
      where: {
        [full(t.task_community).task_id]: full(t.task).id,
        [full(t.community).type]: `'${CommunityType.union}'`,
      },
    },
    dependencies: [
      dependency<Task, TaskCommunity>({
        table: t.task_community,
        target: row => `${full(t.task).id} = ${row.task_id}`
      }),
    ],
    first: true,
  }),
})
