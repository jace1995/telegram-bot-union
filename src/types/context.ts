import { ContextChat, TelegramActionsHandlers, TelegramAppContext } from '@jace1995/telegram-handler'
import { Action } from './actions'
import { Api } from './api'
import { User } from './models'
import { ActionPayloadMap } from './payload'

export type Handler<A extends Action, Context extends ContextChat = ContextChat> = (
  TelegramActionsHandlers<A, Context, Api, User, ActionPayloadMap>
)

export type Context<Payload = unknown, Context extends ContextChat = ContextChat> = (
  TelegramAppContext<Context, Payload, Api, User>
)
