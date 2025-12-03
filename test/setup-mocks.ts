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

mock.module("octokit", () => ({
  Octokit: class {
    rest = {
      repos: {
        listForUser: mockListForUser,
      },
    };
  },
}));
