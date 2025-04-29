import {ERROR_CODES} from './constant'
import {UuidV4IdGenerator} from './id'
import type {
  JsonRpcBuilderOptions,
  JsonRpcError,
  JsonRpcId,
  JsonRpcIdGenerator,
  JsonRpcParams,
  JsonRpcRequest,
  JsonRpcResponse,
} from './types'
import {isClass, isNil} from './utils'

export class JsonRpcBuilder {
  private idGenerator: JsonRpcIdGenerator

  public setIdGenerator(generator: JsonRpcIdGenerator) {
    this.idGenerator = generator
  }

  constructor(options?: JsonRpcBuilderOptions) {
    const {idGenerator = new UuidV4IdGenerator()} = options ?? {}
    this.idGenerator = isClass(idGenerator) ? new idGenerator() : idGenerator
  }

  /**
   * @param notification If true, create a notification and set the id to `null`
   */
  public createRequest<T extends JsonRpcParams>(
    method: string,
    params?: T,
    notification = false,
  ): JsonRpcRequest<T> {
    const id = notification ? null : this.idGenerator.next()
    return {
      jsonrpc: '2.0',
      id,
      method,
      params,
    }
  }

  public createSuccessResponse<T>(id: JsonRpcId, result?: T): JsonRpcResponse<T> {
    return {
      jsonrpc: '2.0',
      id,
      result: result ?? null,
    }
  }

  public createErrorResponse(
    code: number,
    message: string,
    id: JsonRpcId,
    data?: any,
  ): JsonRpcResponse<any> {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        data,
      },
    }
  }

  public createStandardErrorRes(
    errorType: keyof typeof ERROR_CODES,
    id: JsonRpcId,
    data?: any,
  ): JsonRpcResponse<any> {
    const errorCode = ERROR_CODES[errorType]
    const errorMessage = errorType.replace(/_/g, ' ').toLowerCase()
    return this.createErrorResponse(errorCode, errorMessage, id, data)
  }
}
