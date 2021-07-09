import { MicroserviceSocketClient } from '@jace1995/microservice'
import { QueueEvent } from '../queue/types'

export const withLock = async <R>(cb: () => R): Promise<R> => {
  while (true) {
    try {
      return await cb()
    } catch (e) {
      if (typeof e !== 'object' || e.routine !== 'DeadLockReport') {
        throw e
      }
    }
  }
}

export class Queue {
  constructor(private microservice: MicroserviceSocketClient) { }

  async add<R>(data: QueueEvent): Promise<R> {
    return JSON.parse(
      await this.microservice.socket(
        JSON.stringify(data)
      )
    )
  }
}
