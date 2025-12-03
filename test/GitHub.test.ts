import { describe, test, expect, mock, beforeEach } from "bun:test";
import { GitHub } from "../src/tools/GitHub.ts";

// Mock the octokit module
const mockListForUser = mock();
const mockListForAuthenticatedUser = mock();

mock.module("octokit", () => ({
  Octokit: class {
    rest = {
      repos: {
        listForUser: mockListForUser,
      },
      issues: {
        listForAuthenticatedUser: mockListForAuthenticatedUser,
      },
    };
  },
}));

describe("GitHub", () => {
  beforeEach(() => {
    mockListForUser.mockClear();
    mockListForAuthenticatedUser.mockClear();
  });

  describe("listTools", () => {
    test("should return an array with two tools", () => {
      const tools = GitHub.listTools();

      expect(tools).toBeArray();
      expect(tools).toHaveLength(2);
    });

    test("should return list_repositories tool definition", () => {
      const tools = GitHub.listTools();
      const tool = tools[0];

      expect(tool.name).toBe("list_repositories");
      expect(tool.description).toBe(
        "List GitHub repositories for a user or organization",
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

  describe("listRepositories", () => {
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

      const result = await GitHub.listRepositories({
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

      await GitHub.listRepositories({
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

      const result = await GitHub.listRepositories({
        owner: "octocat",
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(
        "Error listing repositories: API rate limit exceeded",
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

      const result = await GitHub.listRepositories({
        owner: "user",
      });

      const repositories = JSON.parse(result.content[0].text);
      expect(repositories[0].description).toBe("No description");
      expect(repositories[0].language).toBe("Unknown");
    });
  });

  describe("get_assigned_pull_requests", () => {
    test("should get assigned pull requests successfully", async () => {
      const mockData = [
        {
          title: "Add new feature",
          number: 42,
          html_url: "https://github.com/octocat/hello-world/pull/42",
          repository_url: "https://api.github.com/repos/octocat/hello-world",
          state: "open",
          user: { login: "contributor" },
          created_at: "2024-01-10T00:00:00Z",
          updated_at: "2024-01-15T00:00:00Z",
          pull_request: {
            url: "https://api.github.com/repos/octocat/hello-world/pulls/42",
          },
        },
        {
          title: "Fix bug in parser",
          number: 123,
          html_url: "https://github.com/octocat/test-repo/pull/123",
          repository_url: "https://api.github.com/repos/octocat/test-repo",
          state: "open",
          user: { login: "developer" },
          created_at: "2024-01-12T00:00:00Z",
          updated_at: "2024-01-16T00:00:00Z",
          pull_request: {
            url: "https://api.github.com/repos/octocat/test-repo/pulls/123",
          },
        },
        {
          title: "Regular issue, not a PR",
          number: 99,
          html_url: "https://github.com/octocat/test-repo/issues/99",
          repository_url: "https://api.github.com/repos/octocat/test-repo",
          state: "open",
          user: { login: "user" },
          created_at: "2024-01-11T00:00:00Z",
          updated_at: "2024-01-14T00:00:00Z",
        },
      ];

      mockListForAuthenticatedUser.mockResolvedValue({ data: mockData });

      const result = await GitHub.getAssignedPullRequests({});

      expect(mockListForAuthenticatedUser).toHaveBeenCalledWith({
        filter: "assigned",
        state: "open",
        sort: "created",
        direction: "desc",
        per_page: 30,
      });

      expect(result.content).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const pullRequests = JSON.parse(result.content[0].text);
      expect(pullRequests).toHaveLength(2); // Should filter out the regular issue

      expect(pullRequests[0]).toEqual({
        title: "Add new feature",
        number: 42,
        url: "https://github.com/octocat/hello-world/pull/42",
        repo: "octocat/hello-world",
        state: "open",
        author: "contributor",
        created_at: "2024-01-10T00:00:00Z",
        updated_at: "2024-01-15T00:00:00Z",
      });

      expect(pullRequests[1]).toEqual({
        title: "Fix bug in parser",
        number: 123,
        url: "https://github.com/octocat/test-repo/pull/123",
        repo: "octocat/test-repo",
        state: "open",
        author: "developer",
        created_at: "2024-01-12T00:00:00Z",
        updated_at: "2024-01-16T00:00:00Z",
      });
    });

    test("should handle custom parameters for get_assigned_pull_requests", async () => {
      mockListForAuthenticatedUser.mockResolvedValue({ data: [] });

      await GitHub.getAssignedPullRequests({
        state: "closed",
        sort: "updated",
        direction: "asc",
        per_page: 10,
      });

      expect(mockListForAuthenticatedUser).toHaveBeenCalledWith({
        filter: "assigned",
        state: "closed",
        sort: "updated",
        direction: "asc",
        per_page: 10,
      });
    });

    test("should return empty array when no PRs assigned", async () => {
      mockListForAuthenticatedUser.mockResolvedValue({ data: [] });

      const result = await GitHub.getAssignedPullRequests({});

      const pullRequests = JSON.parse(result.content[0].text);
      expect(pullRequests).toHaveLength(0);
    });

    test("should handle API errors for get_assigned_pull_requests", async () => {
      mockListForAuthenticatedUser.mockRejectedValue(
        new Error("Authentication required"),
      );

      const result = await GitHub.getAssignedPullRequests({});

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(
        "Error fetching assigned pull requests: Authentication required",
      );
      expect(result.isError).toBe(true);
    });
  });
});
