import { describe, expect, it, vi, beforeEach } from "vitest";
import { JsonRpcBuilder } from "../src/builder";
import {
  CounterIdGenerator,
  UuidV4IdGenerator,
  TimestampIdGenerator,
} from "../src/id";
import type { JsonRpcId } from "../src/types";

const jsonRpcBuilder = new JsonRpcBuilder({
  idGenerator: new CounterIdGenerator(),
});

describe("JsonRpcBuilder", () => {
  describe("createRequest", () => {
    it("应创建标准 JSON-RPC 请求对象", () => {
      const method = "test.method";
      const params = { foo: "bar" };
      const request = jsonRpcBuilder.createRequest(method, params);

      expect(request).toEqual({
        jsonrpc: "2.0",
        id: 0,
        method,
        params,
      });
    });

    it("支持数组类型参数", () => {
      const method = "test.method";
      const params = ["foo", "bar"];
      const request = jsonRpcBuilder.createRequest(method, params);

      expect(request).toEqual({
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      });
    });

    it("当 notification=true 时应创建通知对象（id 为 null）", () => {
      const method = "test.notification";
      const params = { foo: "bar" };
      const notification = jsonRpcBuilder.createRequest(method, params, true);

      expect(notification).toEqual({
        jsonrpc: "2.0",
        id: null,
        method,
        params,
      });
    });

    it("应支持无参数请求", () => {
      const method = "test.noParams";
      const request = jsonRpcBuilder.createRequest(method);

      expect(request).toEqual({
        jsonrpc: "2.0",
        id: 2,
        method,
        params: undefined,
      });
    });
  });

  describe("createSuccessResponse", () => {
    it("应创建标准成功响应对象", () => {
      const result = { success: true, data: [1, 2, 3] };
      const id: JsonRpcId = "test-id";
      const response = jsonRpcBuilder.createSuccessResponse(id, result);

      expect(response).toEqual({
        jsonrpc: "2.0",
        id,
        result,
      });
    });

    it("应支持不同类型的结果数据", () => {
      // 字符串结果
      expect(jsonRpcBuilder.createSuccessResponse(1, "string result")).toEqual({
        jsonrpc: "2.0",
        id: 1,
        result: "string result",
      });

      // 数值结果
      expect(jsonRpcBuilder.createSuccessResponse(2, 42)).toEqual({
        jsonrpc: "2.0",
        id: 2,
        result: 42,
      });

      // null 结果
      expect(jsonRpcBuilder.createSuccessResponse(3, null)).toEqual({
        jsonrpc: "2.0",
        id: 3,
        result: null,
      });
    });
  });

  describe("createErrorResponse", () => {
    it("应创建标准错误响应对象", () => {
      const code = -1;
      const message = "Test error message";
      const id: JsonRpcId = "error-id";
      const data = { detail: "Additional error info" };

      const response = jsonRpcBuilder.createErrorResponse(
        code,
        message,
        id,
        data
      );

      expect(response).toEqual({
        jsonrpc: "2.0",
        id,
        error: {
          code,
          message,
          data,
        },
      });
    });

    it("应支持无 data 参数的错误响应", () => {
      const code = -1;
      const message = "Test error message";
      const id: JsonRpcId = "error-id";

      const response = jsonRpcBuilder.createErrorResponse(code, message, id);

      expect(response).toEqual({
        jsonrpc: "2.0",
        id,
        error: {
          code,
          message,
        },
      });
    });
  });

  describe("createStandardErrorRes", () => {
    it("应创建标准解析错误响应", () => {
      const id: JsonRpcId = "parse-error-id";
      const response = jsonRpcBuilder.createStandardErrorRes("PARSE_ERROR", id);

      expect(response).toEqual({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32700,
          message: "parse error",
        },
      });
    });

    it("应创建标准无效请求错误响应", () => {
      const id: JsonRpcId = "invalid-request-id";
      const response = jsonRpcBuilder.createStandardErrorRes(
        "INVALID_REQUEST",
        id
      );

      expect(response).toEqual({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32600,
          message: "invalid request",
        },
      });
    });

    it("应创建标准方法未找到错误响应", () => {
      const id: JsonRpcId = "method-not-found-id";
      const response = jsonRpcBuilder.createStandardErrorRes(
        "METHOD_NOT_FOUND",
        id
      );

      expect(response).toEqual({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32601,
          message: "method not found",
        },
      });
    });

    it("应创建标准无效参数错误响应", () => {
      const id: JsonRpcId = "invalid-params-id";
      const response = jsonRpcBuilder.createStandardErrorRes(
        "INVALID_PARAMS",
        id
      );

      expect(response).toEqual({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32602,
          message: "invalid params",
        },
      });
    });

    it("应创建标准内部错误响应", () => {
      const id: JsonRpcId = "internal-error-id";
      const data = { reason: "Something went wrong" };
      const response = jsonRpcBuilder.createStandardErrorRes(
        "INTERNAL_ERROR",
        id,
        data
      );

      expect(response).toEqual({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32603,
          message: "internal error",
          data,
        },
      });
    });
  });

  describe("IdGenerator", () => {
    it("应允许设置自定义 ID 生成器", () => {
      // 使用 TimestampIdGenerator
      const timestampGenerator = new TimestampIdGenerator();
      jsonRpcBuilder.setIdGenerator(timestampGenerator);

      // 模拟时间戳
      const mockTimestamp = 1619988000000;
      vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

      const request = jsonRpcBuilder.createRequest("test.method");
      expect(request.id).toBe(mockTimestamp);

      // 还原 Date.now 以避免影响其他测试
      vi.restoreAllMocks();

      // 使用 UuidV4IdGenerator (默认)
      const uuidGenerator = new UuidV4IdGenerator();
      jsonRpcBuilder.setIdGenerator(uuidGenerator);

      const uuidRequest = jsonRpcBuilder.createRequest("test.method");
      expect(typeof uuidRequest.id).toBe("string");
      // UUID 格式检查 (简单版本)
      expect((uuidRequest.id as string).includes("-")).toBe(true);
    });
  });
});
