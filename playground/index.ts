import { CounterIdGenerator, JsonRpcBuilder } from "../src/index";

const builder = new JsonRpcBuilder();

builder.setIdGenerator(new CounterIdGenerator());

const n1 = builder.createRequest("getUser", { name: "1" });
const n2 = builder.createRequest("getUser", { name: "2" });
const n3 = builder.createRequest("getUser", { name: "3" });
const n4 = builder.createRequest("getUser", { name: "4" });
const n5 = builder.createRequest("getUser", { name: "5" });
console.log({
  n1,
  n2,
  n3,
  n4,
  n5,
});
