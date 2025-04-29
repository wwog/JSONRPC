### JsonRpc

[![npm version](https://img.shields.io/npm/v/@wwog/json_rpc.svg)](https://www.npmjs.com/package/@wwog/json_rpc)
[![ESM](https://img.shields.io/badge/📦-ESM%20only-brightgreen.svg)](https://nodejs.org/api/esm.html)

[中文文档](./docs/README_zh.md)

```typescript
import { JsonRpcBuilder, CounterIdGenerator } from "@wwog/jsonRpc";
// or
import JsonRpcBuilder, { CounterIdGenerator } from "@wwog/jsonRpc";

// Change the ID generator
const counterIdGenerator = new CounterIdGenerator();
JsonRpcBuilder.setIdGenerator(counterIdGenerator);
```

1. **Type Definitions**:

   - Defines the core types for JSON-RPC 2.0: `JsonRpcVersion`, `JsonRpcId`, `JsonRpcError`, `JsonRpcRequest`, and `JsonRpcResponse`.
   - Uses TypeScript interfaces and type aliases to ensure type safety.

2. **Features**:

   - `createRequest`: Creates requests or notifications, supports parameters as arrays or objects, no `id` in notification mode.
   - `createSuccessResponse`: Creates successful responses, including results and corresponding `id`.
   - `createErrorResponse`: Creates custom error responses, supporting error codes, messages, and additional data.
   - `createStandardError`: Creates standard error responses using error codes defined in the specification.
   - Built-in 4 types of `IdGenerator`.

3. **Error Handling**:

   - Implements standard error codes from the JSON-RPC 2.0 specification (e.g., `-32700` for parse errors).
   - Supports custom error data fields.

### Notes

- This implementation strictly follows the JSON-RPC 2.0 specification to ensure compatibility.
- The type system ensures the structural correctness of requests and responses.
- Built-in 4 types of ID generators, with UUIdV4 used by default for ID construction.
