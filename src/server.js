import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const TOOLS = JSON.parse(readFileSync(join(here, "tools.json"), "utf8"));
const OWNER = "transparent_meteorite";
const API = process.env.APIFY_API_BASE || "https://api.apify.com";
const byName = new Map(TOOLS.map((t) => [t.name, t]));

export async function runActor(tool, args, token, fetchImpl = fetch) {
  const { max_results, ...input } = args || {};
  const limit = Math.min(Math.max(parseInt(max_results ?? 25, 10) || 25, 1), 200);
  // keep the actor's own cap aligned so we are not billed for rows we drop
  for (const k of ["maxResults", "maxItems", "maxItemsPerQuery"]) {
    if (k in tool.inputSchema.properties && input[k] === undefined) input[k] = limit;
  }
  const url = `${API}/v2/acts/${OWNER}~${tool.slug}/run-sync-get-dataset-items?timeout=240&limit=${limit}`;
  const res = await fetchImpl(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Apify returned HTTP ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

export function createServer(getToken) {
const server = new Server({ name: "open-data-actors-mcp", version: "0.2.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((t) => ({
    name: t.name,
    title: t.title,
    description: t.description,
    inputSchema: t.inputSchema,
    annotations: { readOnlyHint: true, openWorldHint: true, idempotentHint: false, destructiveHint: false },
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = byName.get(req.params.name);
  if (!tool) return { isError: true, content: [{ type: "text", text: `Unknown tool ${req.params.name}` }] };
  const token = getToken();
  if (!token) return { isError: true, content: [{ type: "text", text: "No Apify token supplied (send Authorization: Bearer <token> or ?token=). Create a free Apify account and token at https://console.apify.com/settings/integrations ; the free plan credit covers a trial." }] };
  try {
    const items = await runActor(tool, req.params.arguments, token);
    return { content: [{ type: "text", text: JSON.stringify({ count: items.length, items }, null, 1) }] };
  } catch (e) {
    return { isError: true, content: [{ type: "text", text: String(e.message || e) }] };
  }
});

return server;
}
