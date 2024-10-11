import { Awaiter } from './Awaiter'

export type EventHandler = (event: any) => void
export type EventHandlersCollection = { [name: string]: EventHandler }

export interface BackgroundTaskContext<K extends EventHandlersCollection> {
  breakPoint: () => void
  events: K
}

export class BackgroundTask<T, const K extends EventHandlersCollection> {
  protected awaiter: Awaiter
  protected rejectedReason: string = null
  constructor(readonly handler: (context: BackgroundTaskContext<K>) => Promise<T>, readonly events: K) {
    this.awaiter = new Awaiter()
    this.execute()
  }

  /**
   * Wait for task finish
   */
  async wait() {
    return this.awaiter.wait()
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
  protected async execute() {
    try {
      const result = await this.handler({
        breakPoint: this.breakPoint,
        events: this.events,
      })
      this.breakPoint()
      this.awaiter.resolve(result)
    } catch(e) {
      this.awaiter.reject(e)
    }
  }

  protected getRejectionError() {
    return new Error(`Rejected with reason: ${this.rejectedReason}`)
  }
}
