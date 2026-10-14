// Real MCP client over streamable HTTP against the hosted endpoint.
// Usage: APIFY_TOKEN=... node test/http.test.mjs [url]
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
const url = process.argv[2] || "https://open-data-actors-mcp.vercel.app/mcp";
const token = process.env.APIFY_TOKEN;
const c = new Client({ name: "http-test", version: "1" });
await c.connect(new StreamableHTTPClientTransport(new URL(url), { requestInit: { headers: { Authorization: `Bearer ${token}` } } }));
const { tools } = await c.listTools();
console.log("tools:", tools.length);
if (tools.length !== 29) process.exit(1);
if (token) {
  const r = await c.callTool({ name: "sanctions_screening", arguments: { names: ["Gazprombank"], max_results: 3 } });
  console.log("isError:", !!r.isError, r.content[0].text.slice(0, 400));
  if (r.isError) process.exit(1);
}
await c.close();
