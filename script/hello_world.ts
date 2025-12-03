#!/usr/bin/env bun
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const client = new Client(
    {
      name: "kite-hello-world-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    },
  );

  const transport = new StdioClientTransport({
    command: "bun",
    args: ["run", "src/index.ts"],
  });

  try {
    await client.connect(transport);
    console.log("Connected to MCP server\n");

    const result = await client.callTool({
      name: "hello_world",
      arguments: {},
    });

    console.log("Result:");
    result.content.forEach((item) => {
      if (item.type === "text") {
        console.log(item.text);
      }
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

