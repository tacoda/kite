import { describe, test, expect, mock, beforeEach } from "bun:test";
import { GitHub } from "../src/tools/GitHub.ts";

// Mock the octokit module
const mockListForUser = mock();

mock.module("octokit", () => ({
  Octokit: class {
    rest = {
      repos: {
        listForUser: mockListForUser,
      },
    };
  },
}));

describe("GitHub", () => {
  beforeEach(() => {
    mockListForUser.mockClear();
  });

  describe("listTools", () => {
    test("should return an array with one tool", () => {
      const tools = GitHub.listTools();

      expect(tools).toBeArray();
      expect(tools).toHaveLength(1);
    });

    test("should return list_repositories tool definition", () => {
      const tools = GitHub.listTools();
      const tool = tools[0];

      expect(tool.name).toBe("list_repositories");
      expect(tool.description).toBe(
        "List GitHub repositories for a user or organization"
      );
    });

    test("should have correct input schema", () => {
      const tools = GitHub.listTools();
      const tool = tools[0];

      expect(tool.inputSchema.type).toBe("object");
      expect(tool.inputSchema.properties).toHaveProperty("owner");
      expect(tool.inputSchema.properties).toHaveProperty("type");
      expect(tool.inputSchema.properties).toHaveProperty("sort");
      expect(tool.inputSchema.properties).toHaveProperty("per_page");
      expect(tool.inputSchema.required).toEqual(["owner"]);
    });

    test("should have enum values for type parameter", () => {
      const tools = GitHub.listTools();
      const tool = tools[0];

      expect(tool.inputSchema.properties.type.enum).toEqual([
        "all",
        "owner",
        "member",
      ]);
    });

    test("should have enum values for sort parameter", () => {
      const tools = GitHub.listTools();
      const tool = tools[0];

      expect(tool.inputSchema.properties.sort.enum).toEqual([
        "created",
        "updated",
        "pushed",
        "full_name",
      ]);
    });
  });

  describe("callTool", () => {
    test("should throw error for unknown tool", async () => {
      await expect(GitHub.callTool("unknown_tool", {})).rejects.toThrow(
        "Unknown GitHub tool: unknown_tool"
      );
    });

    test("should call list_repositories successfully", async () => {
      const mockData = [
        {
          name: "hello-world",
          full_name: "octocat/hello-world",
          description: "A test repository",
          html_url: "https://github.com/octocat/hello-world",
          stargazers_count: 100,
          forks_count: 50,
          language: "JavaScript",
          private: false,
          updated_at: "2023-01-01T00:00:00Z",
        },
        {
          name: "test-repo",
          full_name: "octocat/test-repo",
          description: null,
          html_url: "https://github.com/octocat/test-repo",
          stargazers_count: 10,
          forks_count: 5,
          language: null,
          private: true,
          updated_at: "2023-01-02T00:00:00Z",
        },
      ];

      mockListForUser.mockResolvedValue({ data: mockData });

      const result = await GitHub.callTool("list_repositories", {
        owner: "octocat",
      });

      expect(mockListForUser).toHaveBeenCalledWith({
        username: "octocat",
        type: "owner",
        sort: "full_name",
        per_page: 30,
      });

      expect(result.content).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const repositories = JSON.parse(result.content[0].text);
      expect(repositories).toHaveLength(2);

      expect(repositories[0]).toEqual({
        name: "hello-world",
        full_name: "octocat/hello-world",
        description: "A test repository",
        url: "https://github.com/octocat/hello-world",
        stars: 100,
        forks: 50,
        language: "JavaScript",
        private: false,
        updated_at: "2023-01-01T00:00:00Z",
      });

      expect(repositories[1]).toEqual({
        name: "test-repo",
        full_name: "octocat/test-repo",
        description: "No description",
        url: "https://github.com/octocat/test-repo",
        stars: 10,
        forks: 5,
        language: "Unknown",
        private: true,
        updated_at: "2023-01-02T00:00:00Z",
      });
    });

    test("should handle custom parameters", async () => {
      mockListForUser.mockResolvedValue({ data: [] });

      await GitHub.callTool("list_repositories", {
        owner: "github",
        type: "member",
        sort: "updated",
        per_page: 10,
      });

      expect(mockListForUser).toHaveBeenCalledWith({
        username: "github",
        type: "member",
        sort: "updated",
        per_page: 10,
      });
    });

    test("should handle API errors", async () => {
      mockListForUser.mockRejectedValue(new Error("API rate limit exceeded"));

      const result = await GitHub.callTool("list_repositories", {
        owner: "octocat",
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(
        "Error listing repositories: API rate limit exceeded"
      );
      expect(result.isError).toBe(true);
    });

    test("should handle null description and language", async () => {
      const mockData = [
        {
          name: "repo",
          full_name: "user/repo",
          description: null,
          html_url: "https://github.com/user/repo",
          stargazers_count: 0,
          forks_count: 0,
          language: null,
          private: false,
          updated_at: "2023-01-01T00:00:00Z",
        },
      ];

      mockListForUser.mockResolvedValue({ data: mockData });

      const result = await GitHub.callTool("list_repositories", {
        owner: "user",
      });

      const repositories = JSON.parse(result.content[0].text);
      expect(repositories[0].description).toBe("No description");
      expect(repositories[0].language).toBe("Unknown");
    });
  });
});
