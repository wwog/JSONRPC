### JsonRpc

[English Doc](../README.md)

```typescript
import { JsonRpcBuilder, CounterIdGenerator } from "@wwog/jsonRpc";
//or
import JsonRpcBuilder, { CounterIdGenerator } from "@wwog/jsonRpc";

//更换id生成器
const counterIdGenerator = new CounterIdGenerator();
JsonRpcBuilder.setIdGenerator(counterIdGenerator);
```

1. **类型定义**：

   - 定义了 JSON-RPC 2.0 的核心类型：`JsonRpcVersion`、`JsonRpcId`、`JsonRpcError`、`JsonRpcRequest` 和 `JsonRpcResponse`。
   - 使用 TypeScript 的接口和类型别名确保类型安全。

2. **功能特性**：

   - `createRequest`：创建请求或通知，支持参数为数组或对象，通知模式下无 `id`。
   - `createSuccessResponse`：创建成功响应，包含结果和对应的 `id`。
   - `createErrorResponse`：创建自定义错误响应，支持错误码、消息和附加数据。
   - `createStandardError`：创建标准错误响应，使用规范定义的错误码。
   - 内置了 4 种`IdGenerator`,

3. **错误处理**：

   - 实现了 JSON-RPC 2.0 规范中的标准错误码（如 `-32700` 表示解析错误）。
   - 支持自定义错误数据字段。

### 注意事项

- 本实现严格遵循 JSON-RPC 2.0 规范，确保兼容性。
- 类型系统保证了请求和响应的结构正确性。
- 内置了 4 种 id 生成器，默认使用 UUIdV4 来构造 ID。
