import {type JsonRpcIdGenerator, UuidV4IdGenerator} from './id'
import type {JsonRpcId, JsonRpcParams, JsonRpcRequest, JsonRpcResponse} from './types'

export class JsonRpcBuilder {
  private static idGenerator: JsonRpcIdGenerator = new UuidV4IdGenerator()

  public static setIdGenerator(generator: JsonRpcIdGenerator) {
    JsonRpcBuilder.idGenerator = generator
  }

  /**
   * @description 标准错误码(基于JSON-RPC 2.0 规范)
   * @description_en Standard error codes (based on JSON-RPC 2.0 specification)
   */
  private static ERROR_CODES = {
    /**
     * @description 解析错误: 收到无效的JSON
     * @description_en Parse error: Invalid JSON received
     */
    PARSE_ERROR: -32700,
    /**
     * @description 无效请求: 不是一个有效的请求对象
     * @description_en Invalid Request: Not a valid request object
     */
    INVALID_REQUEST: -32600,
    /**
     * @description 方法未找到: 传入的方法不存在
     * @description_en Method not found: The method passed in does not exist
     */
    METHOD_NOT_FOUND: -32601,
    /**
     * @description 无效参数: 传入的参数无效
     * @description_en Invalid params: The parameters passed in are invalid
     */
    INVALID_PARAMS: -32602,
    /**
     * @description 内部错误: 遇到错误，无法完成请求
     * @description_en Internal error: encountered an error and could not complete the request
     */
    INTERNAL_ERROR: -32603,
  }

  /**
   * @param notification If true, create a notification and set the id to `null`
   */
  public static createRequest<T extends JsonRpcParams>(
    method: string,
    params?: T,
    notification = false,
  ): JsonRpcRequest<T> {
    const id = notification ? null : JsonRpcBuilder.idGenerator.next()
    return {
      jsonrpc: '2.0',
      id,
      method,
      params,
    }
  }

  public static createSuccessResponse<T>(result: T, id: JsonRpcId): JsonRpcResponse<T> {
    return {
      jsonrpc: '2.0',
      id,
      result,
    }
  }

  public static createErrorResponse(
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

  public static createStandardErrorRes(
    errorType: keyof typeof JsonRpcBuilder.ERROR_CODES,
    id: JsonRpcId,
    data?: any,
  ): JsonRpcResponse<any> {
    const errorCode = JsonRpcBuilder.ERROR_CODES[errorType]
    const errorMessage = errorType.replace(/_/g, ' ').toLowerCase()
    return JsonRpcBuilder.createErrorResponse(errorCode, errorMessage, id, data)
  }
}
