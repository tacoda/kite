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
      args: ["-r", "./test/setup-mocks.ts", "src/index.ts"],
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
    expect(toolsList.tools.length).toBeGreaterThanOrEqual(3);

    const helloWorldTool = toolsList.tools.find(
      (tool) => tool.name === "hello_world",
    );
    expect(helloWorldTool).toBeDefined();
    expect(helloWorldTool.description).toBe(
      "Returns a simple Hello, World! message",
    );

    const listRepositoriesTool = toolsList.tools.find(
      (tool) => tool.name === "list_repositories",
    );
    expect(listRepositoriesTool).toBeDefined();
    expect(listRepositoriesTool.description).toBe(
      "List GitHub repositories for a user or organization",
    );

    const getAssignedPRsTool = toolsList.tools.find(
      (tool) => tool.name === "get_assigned_pull_requests",
    );
    expect(getAssignedPRsTool).toBeDefined();
    expect(getAssignedPRsTool.description).toBe(
      "Get pull requests assigned to the authenticated user",
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

  test("should call list_repositories tool with mocked GitHub", async () => {
    const result = await client.callTool({
      name: "list_repositories",
      arguments: {
        owner: "octocat",
        per_page: 5,
      },
    });

    expect(result.content).toBeDefined();
    expect(result.content.length).toBe(1);
    expect(result.content[0].type).toBe("text");
    
    // Verify we get the mocked data back
    const repositories = JSON.parse(result.content[0].text);
    expect(repositories).toHaveLength(2);
    expect(repositories[0].name).toBe("Hello-World");
    expect(repositories[0].full_name).toBe("octocat/Hello-World");
    expect(repositories[0].stars).toBe(100);
    expect(repositories[1].name).toBe("Spoon-Knife");
    expect(repositories[1].stars).toBe(200);
  });

  test("should call get_assigned_pull_requests tool with mocked GitHub", async () => {
    const result = await client.callTool({
      name: "get_assigned_pull_requests",
      arguments: {},
    });

    expect(result.content).toBeDefined();
    expect(result.content.length).toBe(1);
    expect(result.content[0].type).toBe("text");
    
    // Verify we get the mocked PR data back
    const pullRequests = JSON.parse(result.content[0].text);
    expect(pullRequests).toHaveLength(2);
    expect(pullRequests[0].title).toBe("Add new feature");
    expect(pullRequests[0].number).toBe(42);
    expect(pullRequests[0].repo).toBe("octocat/Hello-World");
    expect(pullRequests[1].title).toBe("Fix bug in parser");
    expect(pullRequests[1].number).toBe(123);
  });
});
