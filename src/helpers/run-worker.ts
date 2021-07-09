import { Worker } from 'worker_threads'
import { resolve, join } from 'path'

export interface WorkerProps<D = unknown, M = unknown> {
  path: string
  data?: D
  onMessage?: (message: M) => void
  onError?: (error: unknown) => void
  onExit?: (code: number) => void
}

export const runWorker = <D = unknown, M = unknown>(props: WorkerProps<D, M>) => {
  const worker = new Worker(
    resolve(process.cwd(), './worker.js'),
    {
      workerData: {
        path: props.path,
        data: props.data,
      }
    }
  )

  if (props.onMessage) {
    worker.on('message', props.onMessage)
  }

  if (props.onError) {
    worker.on('error', props.onError)
  }

  if (props.onExit) {
    worker.on('exit', props.onExit)
  }
}

export const worker = <D = unknown, R = unknown>(path: string, data: D) => (
  new Promise<R | undefined>(resolve => {
    let result: R | undefined

    runWorker<D, R>({
      data,
      path: join(process.cwd(), path),
      onMessage: message => result = message,
      onExit: () => resolve(result),
    })
  })
)
