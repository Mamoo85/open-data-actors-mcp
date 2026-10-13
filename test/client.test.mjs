// Real MCP client over stdio against the real server. Live call only if APIFY_TOKEN is set.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import assert from "node:assert/strict";

const live = !!process.env.APIFY_TOKEN;
const t = new StdioClientTransport({ command: process.execPath, args: ["src/index.js"], env: { ...process.env } });
const c = new Client({ name: "test", version: "1" });
await c.connect(t);
const { tools } = await c.listTools();
assert.equal(tools.length, 24);
for (const x of tools) { assert.ok(x.description && x.inputSchema.type === "object", x.name); }
console.log("listTools ok:", tools.length, "tools");
const bad = await c.callTool({ name: "nope", arguments: {} });
assert.equal(bad.isError, true);
console.log("unknown tool -> isError ok");
if (live) {
  const r = await c.callTool({ name: "sanctions_screening", arguments: { names: ["Rafael Caro-Quintero"], lists: ["ofac_sdn"], max_results: 3 } });
  assert.ok(!r.isError, JSON.stringify(r.content).slice(0, 300));
  const j = JSON.parse(r.content[0].text);
  assert.ok(j.count >= 1);
  console.log("live tools/call ok: rows =", j.count);
} else {
  const r = await c.callTool({ name: "sanctions_screening", arguments: { names: ["x"] } });
  assert.equal(r.isError, true);
  console.log("no-token path ok (live call skipped)");
}
await c.close();
