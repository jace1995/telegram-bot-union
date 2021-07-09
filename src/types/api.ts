import { ApiInterface } from '@jace1995/telegram-handler'
import {
  ID,
  User,
  Community,
  Member,
  Task,
  TaskProgress,
  Invitation,
  TaskListItem,
  TaskInfo,
  TaskQueue,
  TaskCommunity,
  UnionLocation,
  LocationTaskDetails,
  Role,
  IdProvider,
  TasksCondition,
} from './models'
import { Action } from './actions'
import { ActionPayloadMap } from './payload'

// props

export interface AvailableChats {
  id: User['id']
  chat: User['chat']
}

export interface StatisticsTaskInputData {
  taskId: Task['id']
  communityId: Community['id']
}

export interface StatisticsAlliesInputData {
  communityId: Community['id']
  communityName: Community['name']
}

export interface StatisticsResult {
  filename: string,
  values: unknown[][],
}

export interface UpdateUserValue {
  locked?: User['locked']
  forceLocking?: User['force_locking']
  emergencyUnlocking?: User['emergency_unlocking']
  lockPasswordHash?: User['lock_password_hash']
}

export interface NewCommunity {
  name: Community['name']
  type: Community['type']
  description: Community['description']
  image: Community['image']
}

export interface EditCommunity {
  name?: Community['name']
  description?: Community['description']
  image?: Community['image']
  locations?: Community['locations']
}

export interface NewRole {
  communityId: Community['id']
  role: Member['role']
  membersIds: User['id'][]
}

export interface IsLastLeader {
  communityId: Community['id']
  leaderId: User['id']
}

export interface LeadersForBlock {
  communityId: Community['id']
  leaderIds: User['id'][]
}

export interface LeaveCommunity {
  userId: Member['user_id']
  communityId: Member['community_id']
}

export interface NewTask {
  type: Task['type']
  role: Task['role']
  title: Task['title']
  details: Task['details']
}

export interface AssignTask {
  taskId: Task['id']
  recipientsIds: Community['id'][] // !!! no array, single Community['id']
}

export interface InvitationParticipants {
  allianceId: ID<Community>
  allyId: ID<Community>
}

export interface RequestAssign {
  taskId: Task['id']
  senderId: Community['id']
  recipientsIds: Community['id'][]
}

export interface CancelRequestAssign {
  taskId: Task['id']
  senderId: Community['id']
  recipientId: Community['id']
}

export interface TaskInfoProps {
  taskId: Task['id']
  communityId: Community['id']
  userId: User['id']
}

export interface AddTaskLocationsProps {
  taskId: Task['id']
  communityId: Community['id']
  locations: LocationTaskDetails['locations'][Community['id']]
}

export interface ChangeMembersProgress {
  taskId: Task['id']
  userId: User['id']
  progress: TaskProgress | TaskQueue | undefined
}

export interface ChangeLocationProgress extends ChangeMembersProgress {
  unionId: Community['id']
  locations: LocationTaskDetails['locations']
}

export interface ChangeClosed {
  closed: boolean
  taskId: Task['id']
  communityId?: Community['id']
}

export interface ValidateTask {
  taskId: Task['id']
  communityId: Community['id']
}

export interface TaskValidationInfo {
  role: Task['role']
  closed: TaskCommunity['closed']
}

// methods

export interface InfoApiInterface {
  text(name: string): string
}

export interface UserApiInterface {
  rememberStep(id: User['id'], step: Action): Promise<void>
  resetStep(id: User['id']): Promise<void>
  setStep<A extends Action>(
    id: User['id'],
    action: A,
    payload: A extends keyof ActionPayloadMap ? ActionPayloadMap[A] : null
  ): Promise<void>
  findById(userId: User['id']): Promise<User>
  availableChats(userIds: User['id'][]): Promise<AvailableChats[]>
  update(userId: User['id'], value: UpdateUserValue): Promise<void>
  clearSettings(userId: User['id']): Promise<void>
}

export interface CommunityApiInterface {
  create(community: NewCommunity): Promise<ID<Community>>
  nameExists(name: Community['name']): Promise<boolean>
  findById(communityId: Community['id']): Promise<Community>
  findByIds(communityIds: Community['id'][]): Promise<Community[]>
  edit(communityId: Community['id'], values: EditCommunity): Promise<void>
  close(communityIds: Community['id'] | Community['id'][]): Promise<Community[]>
  statistics(data: StatisticsAlliesInputData): Promise<StatisticsResult | undefined>
}

export interface AllianceApiInterface {
  getInviter(participants: InvitationParticipants): Promise<ID<Community> | null>
  invitations(id: ID<Community>): Promise<Invitation[]>
  sendInvite(invite: Invitation): Promise<void>
  cancelInvite(participants: InvitationParticipants): Promise<void>
  join(participants: InvitationParticipants): Promise<void>
  leave(participants: InvitationParticipants): Promise<void>
  foundCircularNesting(participants: InvitationParticipants): Promise<boolean>
}

export interface MemberApiInterface {
  joinCommunity(membership: Member): Promise<void>
  leaveCommunity(membership: LeaveCommunity): Promise<void>
  leaveAllCommunities(userId: User['id']): Promise<void>
  changeRole(membership: NewRole): Promise<void>
  isLastLeader(membership: IsLastLeader): Promise<boolean>
  lastLeaderCommunities(userId: User['id']): Promise<Community['id'][]>
  leadersForBlock(membership: LeadersForBlock): Promise<User[]>
  findIds(communityIds: Community['id'][], roles: Role[]): Promise<IdProvider[]>
}

export interface TaskApiInterface {
  create(task: NewTask): Promise<ID<Task>>
  list(communityId: Community['id'], roles: Task['role'][]): Promise<TaskListItem[]>
  activeList(conditions: TasksCondition[]): Promise<TaskListItem[]>
  findById(taskId: Task['id']): Promise<Task>
  info(props: TaskInfoProps): Promise<TaskInfo>

  requestAssign(props: RequestAssign): Promise<void>
  cancelRequestAssign(props: CancelRequestAssign): Promise<void>
  requests(recipientId: Community['id']): Promise<TaskListItem[]>
  assignsList(taskId: Task['id']): Promise<TaskCommunity[]>
  assign(props: AssignTask): Promise<void>
  
  updateLocations(
    props: TaskInfoProps,
    locations: LocationTaskDetails['locations'][Community['id']]
  ): Promise<LocationTaskDetails['locations'][Community['id']]>

  addLocations(props: AddTaskLocationsProps): Promise<Task>
  
  changeMembersProgress(props: ChangeMembersProgress): Promise<void>
  changeClosed(props: ChangeClosed): Promise<void>

  accessInfo(props: ValidateTask): Promise<TaskValidationInfo>
  setReady(taskId: Task['id']): Promise<void>
  participantsWait(taskId: Task['id']): Promise<User['id'][]>
  participantsDoing(taskId: Task['id']): Promise<User['id'][]>
  participantsLeader(taskId: Task['id']): Promise<User['id'][]>

  statistics(data: StatisticsTaskInputData): Promise<StatisticsResult | undefined>
}

export interface LocationsApiInterface {
  list(communityId: Community['id']): Promise<Community['locations']>
  findById(communityId: Community['id'], locationId: string): Promise<UnionLocation>
  create(communityId: Community['id'], location: UnionLocation): Promise<void>
  update(
    communityId: Community['id'],
    locationId: string,
    location: UnionLocation
  ): Promise<void>
  delete(communityId: Community['id'], locationId: string): Promise<void>
}

// api

export interface Api extends ApiInterface<User> {
  auth(chatID: number): Promise<User>
  info: InfoApiInterface
  user: UserApiInterface
  community: CommunityApiInterface
  locations: LocationsApiInterface
  alliance: AllianceApiInterface
  member: MemberApiInterface
  task: TaskApiInterface
}
