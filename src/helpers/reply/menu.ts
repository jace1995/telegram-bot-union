import { ExtraReplyMessage } from 'telegraf/typings/telegram-types'
import { Community, CommunityInfo, CommunityType, Role, User } from '../../types/models'
import { Action } from '../../types/actions'
import { menuKeyboard } from '../keyboard'
import { communityLabel } from './community-info'

export type Menu = [string, ExtraReplyMessage]

// Start

export const menuStart = (userId: User['id']): Menu => (
  [
    'Ваш идентификатор: ' + userId,
    menuKeyboard({
      ['Создать сообщество']: Action.create_community,
      ['Вступить в сообщество']: Action.join_community,
      ['Настройки безопасности']: Action.security_settings,
    })
  ]
)

// Community

export interface MenuCommunityData {
  community_id: CommunityInfo['id']
}

export interface MenuCommunityInfo {
  id: CommunityInfo['id']
  name: CommunityInfo['name']
  type: CommunityInfo['type']
}

export const menuData = (community_id: Community['id']): MenuCommunityData => (
  { community_id }
)

// menu buttons

const memberButtons = {
  ['Активные задания']: Action.active_tasks,
  ['Информация сообщества']: Action.community_info,
}

const verifiedButtons = memberButtons

const activistButtons = {
  ['Активные задания']: Action.active_tasks,
  ['Назначить проверенных']: Action.appoint_verified,
  ['Информация сообщества']: Action.community_info,
}

const leaderButtons = {
  ['Создать задание']: Action.create_task,
  ['Активные задания']: Action.active_tasks,
  ['Участники']: Action.members,
  ['Информация сообщества']: Action.community_info,
}

// switch menu

const roleMenu = (community: CommunityInfo, buttons: Record<string, Action>): Menu => ([
  communityLabel(community),
  menuKeyboard<MenuCommunityData>(buttons, menuData(community.id))
])

const unionMenu = (community: CommunityInfo): Menu => {
  switch (community.role) {
    case Role.member: return roleMenu(community, memberButtons)
    case Role.verified: return roleMenu(community, verifiedButtons)
    case Role.activist: return roleMenu(community, activistButtons)
    case Role.leader: return roleMenu(community, leaderButtons)
  }
}

const allianceMenu = (community: CommunityInfo): Menu => (
  community.role === Role.leader ?
    roleMenu(community, leaderButtons) :
    [
      (
        `${communityLabel(community)}\n` +
        `Вы отправили заявку на роль лидера, попросите действующего лидера принять запрос`
      ),
      menuKeyboard<MenuCommunityData>({
        ['отменить заявку']: Action.leave_community
      }, menuData(community.id)),
    ]
)

export const menu = (community: CommunityInfo): Menu => {
  switch (community.type) {
    case CommunityType.union: return unionMenu(community)
    case CommunityType.alliance: return allianceMenu(community)
  }
}
