import {JsonRpcBuilder} from './builder'
import {JsonRpcResponseErr, JsonRpcTimeoutError} from './error'
import type {
  JsonRpcId,
  JsonRpcParams,
  JsonRpcRequest,
  JsonRpcRequestOptions,
  JsonRpcResponseOptions,
  MethodRegistry,
} from './types'
import {isRequest, isResponse, withResolvers} from './utils'

export class JsonRpcRequester {
  private postMessage: (message: any) => void
  private onMessage: (callback: (message: any) => void) => void
  private timeout: number | undefined
  private timeoutMessage: string | undefined
  private pendingRequests: Map<
    JsonRpcId,
    {
      promise: Promise<any>
      resolve: (value?: any) => void
      reject: (reason?: any) => void
    }
  >
  private builder: JsonRpcBuilder

  constructor(options: JsonRpcRequestOptions) {
    this.builder = new JsonRpcBuilder({idGenerator: options.idGenerator})
    this.postMessage = options.postMessage
    this.onMessage = options.onMessage
    this.timeout = options.timeout
    this.timeoutMessage = options.timeoutMessage
    this.pendingRequests = new Map()
    this.register()
  }

  private register() {
    this.onMessage((message: any) => {
      if (isResponse(message) === false) {
        return
      }
      const {id, result, error} = message
      if (!this.pendingRequests.has(id)) {
        return
      }
      const {resolve, reject} = this.pendingRequests.get(id)!
      this.pendingRequests.delete(id)
      if (error) {
        reject(new JsonRpcResponseErr(error))
      } else {
        resolve(result)
      }
    })
  }

  public async request<R>(method: string, params?: JsonRpcParams): Promise<R> {
    const {promise, resolve, reject} = withResolvers<R>()
    const payload = this.builder.createRequest(method, params)
    const id = payload.id
    this.pendingRequests.set(id, {promise, resolve, reject})
    this.postMessage(payload)
    if (this.timeout) {
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new JsonRpcTimeoutError(this.timeout!, this.timeoutMessage ?? 'Timeout'))
        }
      }, this.timeout)
    }
    return promise
  }

  public notify(method: string, params?: JsonRpcParams): JsonRpcRequest<JsonRpcParams> {
    const payload = this.builder.createRequest(method, params, true)
    this.postMessage(payload)
    return payload
  }
}

export class JsonRpcResponder {
  private methodRegistry: MethodRegistry
  private postMessage: (message: any) => void
  private onMessage: (callback: (message: any) => void) => void
  private builder: JsonRpcBuilder = new JsonRpcBuilder()

  constructor(options: JsonRpcResponseOptions) {
    this.methodRegistry = options.methodRegistry ?? {}
    this.postMessage = options.postMessage
    this.onMessage = options.onMessage
    this.register()
  }

  private register() {
    this.onMessage((message: any) => {
      if (isRequest(message) === false) {
        return
      }
      const {id, method, params} = message
      if (this.methodRegistry[method] === undefined) {
        const errorRes = this.builder.createStandardErrorRes('METHOD_NOT_FOUND', id)
        this.postMessage(errorRes)
      } else {
        const handler = this.methodRegistry[method]
        const response = handler(params)
        if (response instanceof Promise) {
          response
            .then((result) => {
              const res = this.builder.createSuccessResponse(id, result)
              this.postMessage(res)
            })
            .catch((error) => {
              const res = this.builder.createStandardErrorRes(error.code, error.message, id)
              this.postMessage(res)
            })
        } else {
          const res = this.builder.createSuccessResponse(id, response)
          this.postMessage(res)
        }
      }
    })
  }
}
