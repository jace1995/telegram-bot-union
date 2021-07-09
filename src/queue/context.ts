import { PostgresDatabaseInterface } from '@jace1995/postgres-helpers'
import { QueueEvent } from './types'

export interface QueueContext {
  pg: PostgresDatabaseInterface
  event: QueueEvent
  queue: Queue
}

export const user = (id: number) => 'u:' + id
export const community = (id: number) => 'c:' + id
export const task = (id: number) => 't:' + id

/*
before lock [ 'c:8441287371', 'c:7765523756' ]
before lock [ 'c:8441287371', 'c:7823561500' ]
before lock [ 'c:4615867057', 'c:7317681142' ]
before lock [ 'c:4615867057', 'c:8441287371' ]
after lock [ 'c:8441287371', 'c:7765523756' ]
after lock [ 'c:4615867057', 'c:7317681142' ]
[ 'A4 ', 'A5 ', 'U3 ', 'U1 ', 'U2 ' ]
before unlock [ 'c:4615867057', 'c:7317681142' ]
after unlock [ 'c:4615867057', 'c:7317681142' ]
before unlock [ 'c:8441287371', 'c:7765523756' ]
after unlock [ 'c:8441287371', 'c:7765523756' ]
after lock [ 'c:8441287371', 'c:7823561500' ]
before unlock [ 'c:8441287371', 'c:7823561500' ]
after unlock [ 'c:8441287371', 'c:7823561500' ]
after lock [ 'c:4615867057', 'c:8441287371' ]
*/

export class Queue {
  private queue = new Set<() => boolean>()
  private keys = new Set<string>()

  async lock(cb: () => Promise<unknown>, ...keys: string[]) {
    await new Promise(resolve => {
      const handler = () => {
        if (keys.every(key => !this.keys.has(key))) {
          keys.forEach(key => this.keys.add(key))
          setTimeout(resolve)
          return true
        }
        return false
      }

      if (!handler()) {
        this.queue.add(handler)
      }
    })

    const result = await cb()

    keys.forEach(key => this.keys.delete(key))

    for (const handler of this.queue) {
      if (handler()) {
        this.queue.delete(handler)
      }
    }

    return result
  }
}
