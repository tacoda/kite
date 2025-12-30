import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Tools } from "./tools/Tools.ts";

const server = new Server(
  {
    name: "kite-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Tools.list(),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return await Tools.call(request.params);
});

async function main() {
  const transport = new StdioServerTransport();
  console.error("[kite] Connecting to transport...");
  await server.connect(transport);
  console.error("[kite] MCP Server running on stdio");
  console.error("[kite] Server ready to accept requests");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
