/**
 * Awaiter, that can await for some action done outside of scope
 */
export class Awaiter<T = any> {
  protected promise: Promise<any>
  protected finished
  protected resolver
  protected rejector
  protected result: T
  protected error: Error

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolver = resolve
      this.rejector = reject
    })
  }

  /**
   * Wait it until it will be resolved.
   *
   * eg. await waiter.wait()
   */
  async wait(): Promise<T> {
    if (this.finished) {
      if (this.error) {
        throw this.error
      }
      return this.result
    }
    return this.promise
  }

  /**
   * Get if it's already resolved
   */
  get resolved(): boolean {
    return this.finished
  }

  /**
   * Reject this promise
   */
  reject(error) {
    if (!this.finished) {
      this.error = error
      this.finished = true
      if (this.resolver) {
        this.rejector(error)
      }
    }
  }

  /**
   * Resolved it, and go forward
   */
  resolve(value: T) {
    if (!this.finished) {
      this.result = value
      this.finished = true
      if (this.resolver) {
        this.resolver(value)
      }
    }
  }
}
