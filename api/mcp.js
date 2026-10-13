// Hosted stateless streamable-HTTP MCP endpoint. Bring-your-own Apify token per request.
// Nothing is stored; tokens are never logged. Rate limit is in-memory per instance (best effort).
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createHash } from "node:crypto";
import { createServer } from "../src/server.js";

const WINDOW_MS = 60_000, LIMIT = 30;
const hits = new Map();
function limited(key) {
  const now = Date.now();
  const h = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  h.push(now); hits.set(key, h);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return h.length > LIMIT;
}
function send(res, code, obj) {
  res.statusCode = code; res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(obj));
}
function getBody(req) {
  if (req.body !== undefined && req.body !== null) return Promise.resolve(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
  return new Promise((ok, no) => {
    let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => { try { ok(d ? JSON.parse(d) : undefined); } catch (e) { no(e); } }); req.on("error", no);
  });
}

export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "authorization, content-type, accept, mcp-protocol-version, mcp-session-id");
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "POST") return send(res, 405, { jsonrpc: "2.0", error: { code: -32000, message: "Stateless server: use POST." }, id: null });

  const url = new URL(req.url, "http://x");
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || "");
  const token = (m && m[1].trim()) || url.searchParams.get("token") || "";
  // rate-limit key: hash of token if present, else client IP (never the raw token)
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  const key = token ? "t:" + createHash("sha256").update(token).digest("hex").slice(0, 16) : "ip:" + ip;
  if (limited(key)) { res.setHeader("retry-after", "60"); return send(res, 429, { jsonrpc: "2.0", error: { code: -32029, message: "Rate limit: 30 requests/minute." }, id: null }); }

  let body;
  try { body = await getBody(req); } catch { return send(res, 400, { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }); }
  const server = createServer(() => token);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on("close", () => { transport.close(); server.close(); });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (e) {
    if (!res.headersSent) send(res, 500, { jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null });
  }
}
