import { User, UnionLocationItem, TaskProgress } from '../../../../types/models'

export interface Counter {
  wasChanges: boolean
}

export const setNextItemProgress = (
  sublocation: UnionLocationItem,
  userId: User['id'],
  counter: Counter
) => {
  if (!sublocation.participant) {
    sublocation.participant = {
      user_id: userId,
      progress: TaskProgress.doing,
    }
    counter.wasChanges = true
    return
  }

  if (
    sublocation.participant.user_id === userId &&
    sublocation.participant.progress === TaskProgress.doing
  ) {
    sublocation.participant = {
      user_id: userId,
      progress: TaskProgress.done,
    }
    counter.wasChanges = true
    return
  }
  
  if (
    sublocation.participant.user_id === userId &&
    sublocation.participant.progress === TaskProgress.done
  ) {
    delete sublocation.participant
    counter.wasChanges = true
    return
  }
}

export const setNextCategoryProgress = (
  sublocations: UnionLocationItem[],
  userId: User['id'],
  counter: Counter
) => {
  if (!sublocations.length) {
    return
  }

  counter.wasChanges = true

  if (sublocations.every(sublocation => sublocation.participant?.progress === TaskProgress.done)) {
    sublocations.forEach(sublocation => delete sublocation.participant)
  }
  else if (
    sublocations.some(sublocation => sublocation.participant?.progress === TaskProgress.done) ||
    sublocations.every(sublocation => sublocation.participant?.progress === TaskProgress.doing)
  ) {
    sublocations.forEach(sublocation => sublocation.participant = {
      user_id: userId,
      progress: TaskProgress.done,
    })
  }
  else {
    sublocations.forEach(sublocation => sublocation.participant = {
      user_id: userId,
      progress: TaskProgress.doing,
    })
  }
}
