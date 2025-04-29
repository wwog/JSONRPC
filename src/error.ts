import type {JsonRpcError} from './types'

export class JsonRpcResponseErr extends Error {
  public code: number
  public data: any

  constructor(payload: JsonRpcError) {
    super(payload.message)
    this.code = payload.code
    this.data = payload.data
    this.name = 'JsonRpcResponseErr'
  }
  toString() {
    return `${this.name}: ${this.message} (${this.code})`
  }
}

export class JsonRpcTimeoutError extends Error {
  public timeout: number
  constructor(timeout: number, message: string) {
    super(message)
    this.timeout = timeout
    this.name = 'JsonRpcTimeoutError'
  }
  toString() {
    return `${this.name}: ${this.message} (${this.timeout}ms)`
  }
}
