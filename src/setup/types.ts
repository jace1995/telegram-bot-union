import { pgArray, pgType } from '@jace1995/postgres-helpers'
import { t } from '../types/models'

export enum Enums {
  action = 'action',
  role = 'role',
  community_type = 'community_type',
  task_type = 'task_type',
}

export const types = {
  length: {
    comunityName: 64,
    comunityDescription: 255,
    taskName: 64,
  },
  steps: pgArray(pgType.custom(Enums.action)),
  pkCommunityFK: {
    type: pgType.pk,
    pk: true,
    fk: {
      tableJoin: t.community,
      key: t.community.id,
    },
  },
  communityFK: {
    type: pgType.pk,
    pk: true,
    fk: {
      tableJoin: t.community,
      key: t.community.id,
    },
  },
  pkTaskFK: {
    type: pgType.pk,
    pk: true,
    fk: {
      tableJoin: t.task,
      key: t.task.id,
    },
  },
}
