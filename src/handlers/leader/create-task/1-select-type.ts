import { ContextButton, formatButtonData, inlineKeyboard } from '@jace1995/telegram-handler'
import { $enum } from 'ts-enum-util'
import { replyFirstInstruction } from '../../../helpers/reply/first-instruction'
import { MenuCommunityData } from '../../../helpers/reply/menu'
import { auth, resetPayload, setStep } from '../../../helpers/user'

import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { labelsTaskType } from '../../../types/labels'
import { Role, TaskType } from '../../../types/models'
import { beforeSelectTaskTarget } from './2-select-target'

import { CreateTaskPayload } from './8-save'

const taskTypes = $enum(TaskType).getValues()

interface SelectTypeData {
  type: CreateTaskPayload['type']
}

export const beforeSelectTaskType: ( 
  Handler<Action.create_task, ContextButton<MenuCommunityData>>
) = async ctx => {
  const community = auth(ctx, Role.leader)

  await ctx.reply('Создать задание')

  await replyFirstInstruction(ctx, Action.create_task)
  
  await ctx.reply(
    'Выберите тип задания', 
    inlineKeyboard(
      taskTypes.map(type => ([{
        text: labelsTaskType[type],
        callback_data: formatButtonData<SelectTypeData>(
          Action.create_task_select_type,
          { type }
        )
      }]))
    )
  )

  await setStep(ctx, Action.create_task_select_type, { community })
}

export const afterSelectTaskType: (
  Handler<Action.create_task_select_type, ContextButton<SelectTypeData>>
) = async ctx => {
  const community = auth(ctx, Role.leader)

  await beforeSelectTaskTarget(
    resetPayload(ctx, {
      ...ctx.user.payload,
      community,
      type: ctx.data.type,
    })
  )
}
