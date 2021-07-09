import { jsonKeys, table, view } from '@jace1995/postgres-helpers'
import { nativeKey, sequenceName } from '@jace1995/postgres-helpers/build/setup/scheme'
import { UserInterface } from '@jace1995/telegram-handler'
import { Action } from './actions'

export type ID<FK = void> = number // pk
export type ChatId = number // int 8
export type Optional<T> = T | null | undefined

export const locationsSequenceKey = 'locations'
export const locationsSequence = nativeKey(sequenceName('locations'))

// user

export interface User<Payload = unknown> extends UserInterface { // table, no delete
  id: ID
  chat: ChatId // index, unique, readonly

  steps: Action[] // Action[], default []
  action: Action // default null
  payload: Payload // jsonb, default null

  // settings
  locked: boolean // default false
  force_locking: boolean // default false
  emergency_unlocking: boolean // default false
  lock_password_hash: string | null // optional

  memberships: CommunityInfo[] // autoupdate (iud UnionMember.role, u Community.name), default []
}

export interface CommunityInfo {
  id: Community['id']
  type: Community['type']
  name: Community['name']
  closed?: Community['closed']
  role: Member['role']
}

// community

export interface Community { // table, no delete
  id: ID
  type: CommunityType // readonly
  name: string // unique
  description?: string // 255
  image?: string // 255
  closed: boolean // default false
  locations: Record<string, UnionLocation> // jsonb, default {}

  users: MemberInfo // autoupdate (iud UnionMember.role), default {}
  alliances: AllianceInfo[] // autoupdate (!!!), default []
  allies: AllyInfo[] // autoupdate (!!!), default []
}

export interface UnionLocation {
  name: string
  text: string
  locations: Record<string, UnionSublocation>
}
export type UnionSublocation = UnionLocationItem | UnionLocationCategory
export interface UnionLocationParticipant {
  user_id: User['id']
  progress: TaskProgress
}
export interface UnionLocationItem {
  name: string
  participant: Optional<UnionLocationParticipant>
}
export interface UnionLocationCategory {
  name: string
  items: string[]
}

export const isLocationCategory = (value: UnionSublocation): value is UnionLocationCategory => (
  !!(value as UnionLocationCategory).items
)

export enum CommunityType {
  union = 'union',
  alliance = 'alliance',
}

export interface MemberInfo {
  leaders: User['id'][]
  activists: User['id'][]
  verifieds: User['id'][]
  members: User['id'][]
  all: User['id'][]
}

export interface Member { // table
  // PK
  user_id: ID<User>
  community_id: ID<Community>

  role: Role // default Role.member
}

export enum Role {
  member = 'member',
  verified = 'verified',
  activist = 'activist',
  leader = 'leader',
}

// alliance

export interface Alliance { // table
  // PK
  alliance_id: ID<Community>
  ally_id: ID<Community>
}

export interface Invitation { // table
  // PK
  alliance_id: ID<Community>
  ally_id: ID<Community>

  inviter_id: ID<Community> // readonly, check = alliance_id | ally_id
}

export interface AllyInfo {
  id: Alliance['ally_id']
  name: Community['name']
  type: Community['type']
}

export interface AllianceInfo {
  id: Alliance['alliance_id']
  name: Community['name']
}

// task

export interface Task { // table
  id: ID
  type: TaskType // readonly
  title: string // varchar 255
  role: Role
  details: SingleTaskDetails | IndividualTaskDetails | LocationTaskDetails // jsonb
  unions: TaskUnionsCounter // autoupdate (iud TaskCommunity), default 0
}

export enum TaskType {
  single = 'single', // разовое
  individual = 'individual', // индивидуальное
  location = 'location', // локационное
}

export interface TaskUnionsCounter {
  count: number
}

export enum TaskQueue {
  wait = 'wait',
}

export enum TaskProgress {
  doing = 'doing',
  done = 'done',
}

export interface TaskDetails {
  description: string
  images: string[]
  documents: string[]
  ready: boolean
}

export interface SingleTaskDetails extends TaskDetails {
  participants: Record<User['id'], TaskProgress | TaskQueue>
  required: number
}

export interface IndividualTaskDetails extends TaskDetails {
  participants: Record<User['id'], TaskProgress>
  required: number
}

export interface LocationTaskDetails extends TaskDetails {
  locations: Record<Community['id'], UnionLocation['locations']>
}

export type FullTaskDetails = SingleTaskDetails & IndividualTaskDetails & LocationTaskDetails

export interface TaskCommunity { // table
  // PK
  task_id: ID<Task>
  community_id: ID<Community>
  
  closed: boolean // default false
}

export interface TaskWaitAssign { // table
  // PK
  task_id: ID<Task>
  from_id: ID<Community>
  to_id: ID<Community>
}

// !!! move -> api

export interface TaskListItem {
  id: Task['id']
  title: Task['title']
  type: Task['type']
  community_id: Community['id']
}

export interface TasksCondition {
  community_id: CommunityInfo['id']
  roles: Member['role'][]
}

export interface TaskInfo {
  id: Task['id']
  type: Task['type']
  title: Task['title']
  role: Task['role']
  closed: TaskCommunity['closed']
  unions_count: number
  ready: TaskDetails['ready']

  description: Task['details']['description']
  images: Task['details']['images']
  documents: Task['details']['documents']
  required: SingleTaskDetails['required']
  
  locations: LocationTaskDetails['locations']

  progress: Optional<TaskProgress | TaskQueue>
  wait: number
  doing: number
  done: number
}

// utils

export interface IdProvider {
  id: ID
}

export const t = {
  user: table<User>('user'),

  community: table<Community>('community'),
  community_info: view<CommunityInfo>(),

  member: table<Member>('member'),
  member_info: view<MemberInfo>(),

  task: table<Task>('task'),
  single_task_details: jsonKeys<SingleTaskDetails>(),
  location_task_details: jsonKeys<LocationTaskDetails>(),
  task_list_item: view<TaskListItem>(),
  task_info: view<TaskInfo>(),
  task_union_counter: view<TaskUnionsCounter>(),
  task_community: table<TaskCommunity>('task_community'),

  alliance: table<Alliance>('alliance'),
  alliance_info: view<AllianceInfo>(),
  ally_info: view<AllyInfo>(),
  invitation: table<Invitation>('invitation'),
  task_wait_assign: table<TaskWaitAssign>('task_wait_assign'),
  user_ids: table<IdProvider>('user_ids'),
}
