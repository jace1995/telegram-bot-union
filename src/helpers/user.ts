import { ContextButton, PreventAction } from '@jace1995/telegram-handler'
import { DialogPrevented } from '@jace1995/telegram-handler/build/start/error-handler'
import { Action } from '../types/actions'
import { Context } from '../types/context'
import { Community, CommunityInfo, CommunityType, Role, User } from '../types/models'
import { ActionPayloadMap } from '../types/payload'
import { MenuCommunityData } from './reply/menu'

export const resetStep = async (ctx: Context) => {
  if (ctx.user.action) {
    await ctx.api.user.resetStep(ctx.user.id)
  }
}

export function setStep<A extends keyof ActionPayloadMap>(
  ctx: Context,
  action: keyof ActionPayloadMap,
  payload: ActionPayloadMap[A]
): Promise<void>
export function setStep<A extends keyof ActionPayloadMap>(
  ctx: Context<ActionPayloadMap[A]>,
  action: A
): Promise<void>
export function setStep(
  ctx: Context,
  action: Action,
  payload: null
): Promise<void>
export async function setStep(
  ctx: Context<any>,
  action: Action,
  payload?: ActionPayloadMap[keyof ActionPayloadMap] | null
): Promise<void> {
  await ctx.api.user.setStep<Action>(ctx.user.id, action, payload ?? ctx.user.payload)
}

export const resetPayload = <Payload>(
  ctx: Context, payload: Payload
): Context<Payload> => {
  const newCtx = ctx as Context<Payload>
  newCtx.user.payload = payload
  return newCtx
}

export const isLeader = (ctx: Context) => (
  ctx.user.memberships.some(community => community.role === Role.leader)
)

export interface AuthPayload {
  community: CommunityInfo
}

export const includeRoles: Record<Role, Role[]> = {
  [Role.leader]: [Role.member, Role.verified, Role.activist, Role.leader],
  [Role.activist]: [Role.verified, Role.activist, Role.leader],
  [Role.verified]: [Role.activist, Role.leader],
  [Role.member]: [Role.leader],
}

export const availableRoles: Record<Role, Role[]> = {
  [Role.leader]: [Role.leader],
  [Role.activist]: [Role.activist, Role.leader],
  [Role.verified]: [Role.verified, Role.activist, Role.leader],
  [Role.member]: [Role.member, Role.verified, Role.activist, Role.leader],
}

export function auth(ctx: Context, role: Role, communityId: Community['id']): CommunityInfo
export function auth(ctx: Context<unknown, ContextButton<MenuCommunityData>>, role: Role): CommunityInfo
export function auth(ctx: Context<AuthPayload>, role: Role): CommunityInfo
export function auth(ctx: Context, role: Role, dataCommunityId?: Community['id']): CommunityInfo {
  const user = ctx.user as User<Partial<AuthPayload> | undefined>
  const data = (ctx as Context<unknown, ContextButton<MenuCommunityData>>).data
  const communityId = dataCommunityId ?? user.payload?.community?.id ?? data.community_id

  if (Number.isInteger(communityId)) {
    const community = user.memberships.find(
      community => community.id === communityId
    )

    if (community && availableRoles[role].includes(role)) {
      return community
    }
  }

  ctx.reply('Нет доступа ⛔').catch(console.error)
  throw new PreventAction()
}

const checkCommunityType = (communityInfo: CommunityInfo, type: CommunityType) => {
  if (communityInfo.type !== type) {
    throw new DialogPrevented()
  }

  return communityInfo
}

export const forUnion = (communityInfo: CommunityInfo) => (
  checkCommunityType(communityInfo, CommunityType.union)
)

export const forAlliance = (communityInfo: CommunityInfo) => (
  checkCommunityType(communityInfo, CommunityType.alliance)
)
