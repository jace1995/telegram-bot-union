import { isLocationCategory, UnionSublocation } from '../../../../types/models'
import { TaskProgress, UnionLocationItem, User } from '../../../../types/models'

const getItemStatus = (
  participant: UnionLocationItem['participant'],
  userId: User['id']
): string => {
  if (!participant) {
    return '⏹'
  }

  if (participant.user_id === userId) {
    switch (participant.progress) {
      case TaskProgress.doing:
        return '☑️'
      case TaskProgress.done:
        return '✅'
    }
  }
  else {
    switch (participant.progress) {
      case TaskProgress.doing:
        return '◼️'
      case TaskProgress.done:
        return '✔️'
    }
  }
}

export const getStatus = (
  sublocation: UnionSublocation,
  userId: User['id']
) => (
  isLocationCategory(sublocation) ?
    '' :
    getItemStatus(sublocation.participant, userId)
)
