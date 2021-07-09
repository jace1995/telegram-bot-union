import { createTable, column } from '@jace1995/postgres-helpers'
import { Alliance, t } from '../../types/models'
import { types } from '../types'

export const createAllianceTable = createTable<Alliance>(t.alliance, {
  alliance_id: column(types.pkCommunityFK),
  ally_id: column(types.pkCommunityFK),
})
