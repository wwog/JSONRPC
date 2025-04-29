/**
 * @description 标准错误码(基于JSON-RPC 2.0 规范)
 * @description_en Standard error codes (based on JSON-RPC 2.0 specification)
 */
export const ERROR_CODES = {
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
