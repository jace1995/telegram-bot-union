import { createTable, column, constraintCheck } from '@jace1995/postgres-helpers'
import { Invitation, t } from '../../types/models'
import { types } from '../types'

export const createInvitationTable = createTable<Invitation>(t.invitation, {
  alliance_id: column(types.pkCommunityFK),
  ally_id: column(types.pkCommunityFK),
  inviter_id: column(types.communityFK),
}, [
  constraintCheck(
    `${t.invitation.inviter_id} = ${t.invitation.alliance_id} or ` +
    `${t.invitation.inviter_id} = ${t.invitation.ally_id}`
  )
])
