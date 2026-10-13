#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
await createServer(() => process.env.APIFY_TOKEN).connect(new StdioServerTransport());
