import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

describe("Kite MCP Server", () => {
  let client;
  let transport;

  beforeAll(async () => {
    client = new Client(
      {
        name: "kite-test-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      },
    );

    transport = new StdioClientTransport({
      command: "bun",
      args: ["run", "src/index.ts"],
    });

    await client.connect(transport);
  });

  afterAll(async () => {
    await client.close();
  });

  test("should connect to server", () => {
    expect(client).toBeDefined();
  });

  test("should list available tools", async () => {
    const toolsList = await client.listTools();

    expect(toolsList.tools).toBeDefined();
    expect(toolsList.tools.length).toBeGreaterThan(0);

    const helloWorldTool = toolsList.tools.find(
      (tool) => tool.name === "hello_world",
    );
    expect(helloWorldTool).toBeDefined();
    expect(helloWorldTool.description).toBe(
      "Returns a simple Hello, World! message",
    );
  });

  test("should call hello_world tool", async () => {
    const result = await client.callTool({
      name: "hello_world",
      arguments: {},
    });

    expect(result.content).toBeDefined();
    expect(result.content.length).toBe(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe("Hello, World!");
  });

  test("should throw error for unknown tool", async () => {
    expect(async () => {
      await client.callTool({
        name: "nonexistent_tool",
        arguments: {},
      });
    }).toThrow();
  });
});
