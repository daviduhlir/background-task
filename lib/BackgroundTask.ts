import { Awaiter } from './Awaiter'

export type EventHandler<T = any> = (event: T) => void
export interface EventHandlersCollection {
  [name: string]: EventHandler
}

export interface BackgroundTaskContext<K extends EventHandlersCollection> {
  breakPoint: () => void
  events: K
}

export class BackgroundTask<K extends EventHandlersCollection = {}, T = any> {
  protected awaiter: Awaiter
  protected rejectedReason: string = null
  protected alreadyStarted = false

  protected events: K
  protected handler: (context: BackgroundTaskContext<K>) => Promise<T>

  /**
   * Creates background task
   * @param events - events map
   * @param {*} handler - promise handler
   * @param autostart - start task automaticaly
   */
  constructor(handler: (context: BackgroundTaskContext<null>, autostart?: boolean) => Promise<T>)
  constructor(events: K, handler: (context: BackgroundTaskContext<K>, autostart?: boolean) => Promise<T>)
  constructor(arg1: any, arg2?: any, arg3?: any) {
    this.handler = typeof arg1 === 'function' ? arg1 : arg2
    this.events = typeof arg1 === 'object' ? arg1 : {}
    const autostart = typeof arg2 === 'boolean' ? arg2 : arg3

    this.awaiter = new Awaiter()

    if (autostart) {
      this.start()
    }
  }

  /**
   * Starts the operation, if not started before
   */
  async start() {
    this.execute(this.handler, this.events)
    return this.await()
  }

  /**
   * Wait for task finish
   */
  async await() {
    return this.awaiter.await()
  }

  /**
   * Reject this promise
   */
  reject(reason: string = 'unknown') {
    this.rejectedReason = reason
    this.awaiter.reject(this.getRejectionError())
  }

  /**
   * Handler breakpoint
   */
  protected breakPoint() {
    if (this.rejectedReason) {
      throw this.getRejectionError()
    }
  }

  /**
   * Execute task
   */
  protected async execute(handler: (context: BackgroundTaskContext<K>) => Promise<T>, events: K) {
    if (this.alreadyStarted) {
      return
    }
    this.alreadyStarted = true
    try {
      const result = await handler({
        breakPoint: this.breakPoint,
        events: events,
      })
      this.breakPoint()
      this.awaiter.resolve(result)
    } catch(e) {
      this.awaiter.reject(e)
    }
  }

  /**
   * Get rejection error
   */
  protected getRejectionError() {
    return new Error(`Rejected with reason: ${this.rejectedReason}`)
  }
}
