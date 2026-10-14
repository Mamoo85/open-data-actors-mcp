// Live check of the 5 newest tools (small inputs). Needs APIFY_TOKEN.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import assert from "node:assert/strict";
const t = new StdioClientTransport({ command: process.execPath, args: ["src/index.js"], env: { ...process.env } });
const c = new Client({ name: "test", version: "1" });
await c.connect(t);
const calls = {
  google_maps_places_scraper: { searchStringsArray: ["coffee shop"], locationQuery: "Detroit, MI", max_results: 2 },
  tiktok_public_profile_scraper: { profiles: ["natgeo"], resultsPerPage: 2, resultsType: "posts", max_results: 2 },
  youtube_comments_scraper: { startUrls: [{ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }], maxComments: 3, max_results: 3 },
  amazon_bestsellers: { categories: ["electronics"], listTypes: ["bestsellers"], countryCode: "US", max_results: 3 },
  sam_gov_opportunities: { keywords: ["software"], postedWithinDays: 7, max_results: 2 },
};
for (const [name, args] of Object.entries(calls)) {
  const r = await c.callTool({ name, arguments: args });
  assert.ok(!r.isError, name + " " + JSON.stringify(r.content).slice(0, 300));
  console.log(name, "rows =", JSON.parse(r.content[0].text).count);
}
await c.close();
