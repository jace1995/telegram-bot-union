import { CommunityType, Role, TaskType } from './models'

export const labelsRole: Record<Role, string> = {
  [Role.member]: 'участник',
  [Role.verified]: 'проверенный',
  [Role.activist]: 'активист',
  [Role.leader]: 'лидер',
}

export const labelsTaskTarget: Record<Role, string> = {
  [Role.member]: 'всем',
  [Role.verified]: 'проверенным',
  [Role.activist]: 'активистам',
  [Role.leader]: 'лидерам',
}

export const labelsTaskType: Record<TaskType, string> = {
  [TaskType.single]: 'разовое',
  [TaskType.individual]: 'индивидуальное',
  [TaskType.location]: 'локационное',
}

export const labelsCommunityType: Record<CommunityType, string> = {
  [CommunityType.union]: 'Объединение',
  [CommunityType.alliance]: 'Альянс',
}
