import { menuKeyboard } from '../../../helpers/keyboard'
import { auth, setStep } from '../../../helpers/user'

import { Action } from '../../../types/actions'
import { Handler } from '../../../types/context'
import { labelsTaskTarget, labelsTaskType } from '../../../types/labels'
import { Role, TaskType } from '../../../types/models'

export const confirmNewTask: (
  Handler<Action.create_task_confirm>
) = async ctx => {
  auth(ctx, Role.leader)
  const task = ctx.user.payload

  await ctx.reply(
    'Итоговый вариант\n' +
    `сообщество: "${ctx.user.payload.community.name}"\n` +
    `задание: ${task.title}\n` +
    'тип: ' + labelsTaskType[task.type] + '\n' +
    'кому разослать: ' + labelsTaskTarget[task.role] + '\n' +
    (
      task.type === TaskType.single || task.type === TaskType.individual ? (
        task.required ? `Минимальное количество участников: ${task.required}` : ''
      ) : (
        task.locationsName ? `Локация: ${task.locationsName}` : 'Новая локация'
      )
    ) + '\n' +
    'изображений: ' + task.images.length + '\n' +
    'документов: ' + task.documents.length + '\n' +
    'текст:\n' + task.description,
    menuKeyboard({
      ['отправить']: Action.create_task_save
    })
  )

  await setStep(ctx, Action.create_task_save)
}
