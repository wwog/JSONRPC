import type {JsonRpcRequest, JsonRpcResponse} from './types'

export const isClass = (value: any): value is new (...args: any[]) => any => {
  if (!value || typeof value !== 'function') {
    return false
  }

  const isClassSyntax = /^class\s/.test(Function.prototype.toString.call(value))

  return isClassSyntax
}

export const isNil = (value: any): value is null | undefined => {
  return value === null || value === undefined
}

export const withResolvers = <T>() => {
  let resolve: ((value: T) => void) | undefined = undefined
  let reject: ((reason?: any) => void) | undefined = undefined

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  }
}

export const isResponse = (message: any): message is JsonRpcResponse<any> => {
  if (typeof message !== 'object') {
    return false
  }
  if (message.jsonrpc === '2.0' && isNil(message.id) === false) {
    //result or error is required
    if (message.result === undefined && message.error === undefined) {
      return false
    }
  }

  return true
}

export const isRequest = (message: any): message is JsonRpcRequest<any> => {
  if (typeof message !== 'object') {
    return false
  }
  if (message.jsonrpc === '2.0' && message.id !== undefined) {
    //params is optional
    if (message.method === undefined) {
      return false
    }
  }

  return true
}
