import { CounterIdGenerator, JsonRpcBuilder } from "../src/index";

JsonRpcBuilder.setIdGenerator(new CounterIdGenerator);

const n1 = JsonRpcBuilder.createRequest("getUser", { name: "1" });
const n2 = JsonRpcBuilder.createRequest("getUser", { name: "2" });
const n3 = JsonRpcBuilder.createRequest("getUser", { name: "3" });
const n4 = JsonRpcBuilder.createRequest("getUser", { name: "4" });
const n5 = JsonRpcBuilder.createRequest("getUser", { name: "5" });
console.log({
  n1,
  n2,
  n3,
  n4,
  n5,
});
