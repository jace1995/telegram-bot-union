import { AuthPayload } from '../../../../helpers/user'
import { Community, User } from '../../../../types/models'
import { TaskData } from '../../../member/task/common-individual-single'

export enum ForwardMethod {
  copy = 'copy',
  original = 'original',
}

export enum ForwardDirection {
  up,
  down,
}

export interface CommunityForSelect {
  name: Community['name']
  direction: ForwardDirection
  selected: boolean
}

export interface ForwardTaskPayload extends AuthPayload {
  taskData: TaskData
  selection: Record<Community['id'], CommunityForSelect>
  alliancesCount: number
  alliesCount: number
  communitiesCount: number
  leadersIds: User['id'][]
}

export interface ForwardCommunity {
  id: Community['id'],
  name: Community['name']
}
