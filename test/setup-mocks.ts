import { mock } from "bun:test";

// Mock the octokit module before any imports
export const mockListForUser = mock(async (params: any) => {
  return {
    data: [
      {
        name: "Hello-World",
        full_name: "octocat/Hello-World",
        description: "My first repository on GitHub!",
        html_url: "https://github.com/octocat/Hello-World",
        stargazers_count: 100,
        forks_count: 50,
        language: "JavaScript",
        private: false,
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        name: "Spoon-Knife",
        full_name: "octocat/Spoon-Knife",
        description: "This repo is for demonstration purposes only.",
        html_url: "https://github.com/octocat/Spoon-Knife",
        stargazers_count: 200,
        forks_count: 100,
        language: "HTML",
        private: false,
        updated_at: "2024-01-02T00:00:00Z",
      },
    ],
  };
});

export const mockListForAuthenticatedUser = mock(async (params: any) => {
  return {
    data: [
      {
        title: "Add new feature",
        number: 42,
        html_url: "https://github.com/octocat/Hello-World/pull/42",
        repository_url: "https://api.github.com/repos/octocat/Hello-World",
        state: "open",
        user: { login: "contributor" },
        created_at: "2024-01-10T00:00:00Z",
        updated_at: "2024-01-15T00:00:00Z",
        pull_request: { url: "https://api.github.com/repos/octocat/Hello-World/pulls/42" },
      },
      {
        title: "Fix bug in parser",
        number: 123,
        html_url: "https://github.com/octocat/Spoon-Knife/pull/123",
        repository_url: "https://api.github.com/repos/octocat/Spoon-Knife",
        state: "open",
        user: { login: "developer" },
        created_at: "2024-01-12T00:00:00Z",
        updated_at: "2024-01-16T00:00:00Z",
        pull_request: { url: "https://api.github.com/repos/octocat/Spoon-Knife/pulls/123" },
      },
    ],
  };
});

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
