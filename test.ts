#!/usr/bin/env bun
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function testHelloWorld() {
  console.log("Starting MCP Client Test...\n");

  const client = new Client(
    {
      name: "kite-test-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  const transport = new StdioClientTransport({
    command: "bun",
    args: ["run", "index.ts"],
  });

  try {
    await client.connect(transport);
    console.log("✓ Connected to MCP server\n");

    // List available tools
    const toolsList = await client.listTools();
    console.log("Available tools:");
    toolsList.tools.forEach((tool) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log();

    // Call hello_world tool
    console.log("Invoking hello_world tool...");
    const result = await client.callTool({
      name: "hello_world",
      arguments: {},
    });

    console.log("Result:");
    result.content.forEach((item) => {
      if (item.type === "text") {
        console.log(`  ${item.text}`);
      }
    });

    console.log("\n✓ Test completed successfully");
  } catch (error) {
    console.error("✗ Test failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testHelloWorld();
