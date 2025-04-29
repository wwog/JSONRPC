export abstract class JsonRpcIdGenerator {
  abstract next(): string | number
}

export type JsonRpcIdGeneratorConstructor = new () => JsonRpcIdGenerator

export type JsonRpcVersion = '2.0'

/**
 * null is intended for 1.0 and is avoided
 */
export type JsonRpcId = string | number | null

export interface JsonRpcError {
  code: number
  message: string
  data?: any
}

export type JsonRpcParams = any[] | Record<string, any>

export interface JsonRpcRequest<P extends JsonRpcParams> {
  jsonrpc: JsonRpcVersion
  id: JsonRpcId
  method: string
  params?: P
}

export interface JsonRpcResponse<T> {
  jsonrpc: JsonRpcVersion
  id: JsonRpcId
  result?: T | null
  error?: JsonRpcError
}

export interface JsonRpcBuilderOptions {
  idGenerator?: JsonRpcIdGenerator | JsonRpcIdGeneratorConstructor
}

export interface JsonRpcNotification<P extends JsonRpcParams> {
  jsonrpc: JsonRpcVersion
  method: string
  params?: P
}

export type JsonRpcBatchRequest = Array<JsonRpcRequest<any>>

export interface JsonRpcRequestOptions {
  idGenerator?: JsonRpcIdGenerator | JsonRpcIdGeneratorConstructor
  timeout?: number
  timeoutMessage?: string
  postMessage: (message: any) => void
  onMessage: (callback: (message: any) => void) => void
}

export type MethodHandler = (params: JsonRpcParams) => Promise<any> | any

export interface MethodRegistry {
  [method: string]: MethodHandler
}

export interface JsonRpcResponseOptions {
  methodRegistry?: MethodRegistry
  postMessage: (message: any) => void
  onMessage: (callback: (message: any) => void) => void
}
