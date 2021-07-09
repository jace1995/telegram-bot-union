import { IN, PostgresDatabaseInterface } from '@jace1995/postgres-helpers'
import { QueueAction } from '../queue/types'
import { AllianceApiInterface, InvitationParticipants } from '../types/api'
import { Alliance, Community, CommunityType, ID, Invitation, t } from '../types/models'
import { Queue, withLock } from './utils'

export class AllianceApi implements AllianceApiInterface {
  constructor(
    private pg: PostgresDatabaseInterface,
    private queue: Queue
  ) { }

  getInviter(participants: InvitationParticipants) {
    return this.pg.select<Invitation, ID<Community>>(v => ({
      table: t.invitation,
      where: {
        [t.invitation.alliance_id]: v(participants.allianceId),
        [t.invitation.ally_id]: v(participants.allyId),
      },
      first: t.invitation.inviter_id,
    }))
  }

  invitations(id: ID<Community>) {
    return this.pg.select<Invitation>(v => ({
      table: t.invitation,
      where: {
        [t.invitation.inviter_id]: v(id),
      },
    }))
  }

  async sendInvite(invite: Invitation) {
    await this.pg.insert<Invitation>(v => ({
      table: t.invitation,
      value: {
        [t.invitation.alliance_id]: v(invite.alliance_id),
        [t.invitation.ally_id]: v(invite.ally_id),
        [t.invitation.inviter_id]: v(invite.inviter_id),
      },
    }))
  }

  async cancelInvite(participants: InvitationParticipants) {
    await this.pg.delete<Invitation>(v => ({
      table: t.invitation,
      where: {
        [t.invitation.alliance_id]: v(participants.allianceId),
        [t.invitation.ally_id]: v(participants.allyId),
      },
    }))
  }
  
  async join(participants: InvitationParticipants) {
    await this.queue.add([QueueAction.join_alliance, participants])
  }

  async leave(participants: InvitationParticipants) {
    await this.queue.add([QueueAction.leave_alliance, participants])
  }

  async foundCircularNesting(participants: InvitationParticipants) {
    let ids: Community['id'][] = [participants.allianceId]

    while (ids.length) {
      const communities = await this.pg.select<Community>(v => ({
        table: t.community,
        where: (
          `${t.community.id} ${IN(ids.map(v))}` +
          ` and ${t.community.type} = ${v(CommunityType.alliance)}`
        ), // ! refactoring in
      }))

      if (communities.some(community => community.id === participants.allyId)) {
        return true
      }

      ids = []

      communities.forEach(community => {
        ids.push(...community.alliances.map(alliance => alliance.id))
      })
    }

    return false
  }
}
