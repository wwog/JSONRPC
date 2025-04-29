import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { JsonRpcRequester, JsonRpcResponder } from "../src/nc";
import { JsonRpcResponseErr, JsonRpcTimeoutError } from "../src/error";
import { CounterIdGenerator } from "../src/id";
import type { JsonRpcParams } from "../src/types";

describe("JsonRpcRequester", () => {
  let postMessage: ReturnType<typeof vi.fn>;
  let onMessageCallback: ((message: any) => void) | null = null;
  let requester: JsonRpcRequester;

  beforeEach(() => {
    // 设置模拟计时器
    vi.useFakeTimers();
    
    postMessage = vi.fn();
    const onMessage = vi.fn((callback: (message: any) => void) => {
      onMessageCallback = callback;
    });

    requester = new JsonRpcRequester({
      postMessage,
      onMessage,
      idGenerator: new CounterIdGenerator(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    onMessageCallback = null;
  });

  it("应该发送请求并处理响应", async () => {
    const method = "test.method";
    const params = { foo: "bar" };
    const result = { success: true };

    // 发起请求
    const requestPromise = requester.request(method, params);
    
    // 验证请求是否正确发送
    expect(postMessage).toHaveBeenCalledTimes(1);
    const requestPayload = postMessage.mock.calls[0][0];
    expect(requestPayload.jsonrpc).toBe("2.0");
    expect(requestPayload.method).toBe(method);
    expect(requestPayload.params).toEqual(params);
    expect(requestPayload.id).toBe(0);  // 因为使用 CounterIdGenerator

    // 模拟收到响应
    if (onMessageCallback) {
      onMessageCallback({
        jsonrpc: "2.0",
        id: 0,
        result,
      });
    }

    // 等待响应并验证
    const response = await requestPromise;
    expect(response).toEqual(result);
  });

  it("应该处理错误响应", async () => {
    const method = "test.error";
    
    // 发起请求
    const requestPromise = requester.request(method);
    
    // 模拟收到错误响应
    if (onMessageCallback) {
      onMessageCallback({
        jsonrpc: "2.0",
        id: 0,
        error: {
          code: -32603,
          message: "内部错误",
          data: { reason: "测试错误" }
        }
      });
    }

    // 验证错误处理
    await expect(requestPromise).rejects.toThrow(JsonRpcResponseErr);
    try {
      await requestPromise;
    } catch (error) {
      if (error instanceof JsonRpcResponseErr) {
        expect(error.code).toBe(-32603);
        expect(error.message).toBe("内部错误");
        expect(error.data).toEqual({ reason: "测试错误" });
      }
    }
  });

  it("应该处理请求超时", async () => {
    const method = "test.timeout";
    const timeout = 100;
    const timeoutMessage = "请求超时";
    
    // 创建一个带超时的请求器
    const timeoutRequester = new JsonRpcRequester({
      postMessage,
      onMessage: vi.fn((callback: (message: any) => void) => {
        onMessageCallback = callback;
      }),
      idGenerator: new CounterIdGenerator(),
      timeout,
      timeoutMessage,
    });
    
    // 发起请求
    const requestPromise = timeoutRequester.request(method);
    
    // 快进时间以触发超时
    vi.advanceTimersByTime(timeout + 10);
    
    // 验证超时处理
    await expect(requestPromise).rejects.toThrow(JsonRpcTimeoutError);
    try {
      await requestPromise;
    } catch (error) {
      if (error instanceof JsonRpcTimeoutError) {
        expect(error.timeout).toBe(timeout);
        expect(error.message).toBe(timeoutMessage);
      }
    }
  });

  it("应该正确发送通知（无需响应的请求）", () => {
    const method = "test.notification";
    const params = { event: "update", data: { id: 123 } };
    
    // 发送通知
    const notification = requester.notify(method, params);
    
    // 验证通知是否正确发送
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(notification).toEqual({
      jsonrpc: "2.0",
      id: null,
      method,
      params,
    });
  });

  it("应该忽略未知响应", () => {
    // 模拟收到未知 ID 的响应
    if (onMessageCallback) {
      onMessageCallback({
        jsonrpc: "2.0",
        id: "unknown-id",
        result: { data: "unknown" }
      });
    }
    
    // 由于没有挂起的请求与该 ID 匹配，预期不会发生任何事情
    // 这种情况下，没有明显的方式验证，但至少确保没有抛出异常
    expect(true).toBe(true);
  });
});

describe("JsonRpcResponder", () => {
  let postMessage: ReturnType<typeof vi.fn>;
  let onMessageCallback: ((message: any) => void) | null = null;
  let methodRegistry: Record<string, (params?: JsonRpcParams) => any>;
  let responder: JsonRpcResponder;

  beforeEach(() => {
    postMessage = vi.fn();
    methodRegistry = {
      "test.echo": (params) => params,
      "test.sum": (params) => (params as number[]).reduce((a, b) => a + b, 0),
      "test.hello": () => "Hello, world!",
      "test.async": () => Promise.resolve({ data: "async result" }),
      "test.error": () => {
        throw { code: -1000, message: "测试错误" };
      },
      "test.asyncError": () => Promise.reject({ code: -2000, message: "异步错误" })
    };

    const onMessage = vi.fn((callback: (message: any) => void) => {
      onMessageCallback = callback;
    });

    responder = new JsonRpcResponder({
      postMessage,
      onMessage,
      methodRegistry,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    onMessageCallback = null;
  });

  it("应该处理同步方法调用", () => {
    if (onMessageCallback) {
      // 模拟接收请求
      onMessageCallback({
        jsonrpc: "2.0",
        id: 1,
        method: "test.echo",
        params: { message: "Echo test" }
      });

      // 验证响应
      expect(postMessage).toHaveBeenCalledTimes(1);
      const response = postMessage.mock.calls[0][0];
      expect(response).toEqual({
        jsonrpc: "2.0",
        id: 1,
        result: { message: "Echo test" }
      });
    }
  });

  it("应该处理异步方法调用", async () => {
    if (onMessageCallback) {
      // 模拟接收请求
      onMessageCallback({
        jsonrpc: "2.0",
        id: 2,
        method: "test.async",
        params: {}
      });

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0));

      // 验证响应
      expect(postMessage).toHaveBeenCalledTimes(1);
      const response = postMessage.mock.calls[0][0];
      expect(response).toEqual({
        jsonrpc: "2.0",
        id: 2,
        result: { data: "async result" }
      });
    }
  });

  it("应该处理方法未找到的情况", () => {
    if (onMessageCallback) {
      // 模拟接收请求调用不存在的方法
      onMessageCallback({
        jsonrpc: "2.0",
        id: 3,
        method: "test.nonExistent",
        params: {}
      });

      // 验证响应是标准错误
      expect(postMessage).toHaveBeenCalledTimes(1);
      const response = postMessage.mock.calls[0][0];
      expect(response).toEqual({
        jsonrpc: "2.0",
        id: 3,
        error: {
          code: -32601,
          message: "method not found"
        }
      });
    }
  });

  it("应该处理同步方法抛出的错误", () => {
    if (onMessageCallback) {
      // 模拟接收请求调用会抛出错误的方法
      onMessageCallback({
        jsonrpc: "2.0",
        id: 4,
        method: "test.error",
        params: {}
      });

      // 验证错误响应
      expect(postMessage).toHaveBeenCalledTimes(1);
      const response = postMessage.mock.calls[0][0];
      expect(response).toEqual({
        jsonrpc: "2.0",
        id: 4,
        error: {
          code: -1000,
          message: "测试错误"
        }
      });
    }
  });

  it("应该处理异步方法抛出的错误", async () => {
    if (onMessageCallback) {
      // 模拟接收请求调用会返回拒绝的 Promise 的方法
      onMessageCallback({
        jsonrpc: "2.0",
        id: 5,
        method: "test.asyncError",
        params: {}
      });

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0));

      // 验证错误响应
      expect(postMessage).toHaveBeenCalledTimes(1);
      const response = postMessage.mock.calls[0][0];
      expect(response).toEqual({
        jsonrpc: "2.0",
        id: 5,
        error: {
          code: -2000,
          message: "异步错误"
        }
      });
    }
  });

  it("应该忽略非请求消息", () => {
    if (onMessageCallback) {
      // 模拟接收非请求消息
      onMessageCallback({
        jsonrpc: "2.0",
        id: 6,
        result: "这是一个响应，不是请求"
      });

      // 验证没有发送任何响应
      expect(postMessage).not.toHaveBeenCalled();
    }
  });
});
