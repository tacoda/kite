import { Octokit } from "octokit";

export namespace GitHub {
  export function listTools() {
    return [
      {
        name: "list_repositories",
        description: "List GitHub repositories for a user or organization",
        inputSchema: {
          type: "object",
          properties: {
            owner: {
              type: "string",
              description: "GitHub username or organization name",
            },
            type: {
              type: "string",
              enum: ["all", "owner", "member"],
              description: "Type of repositories to list (default: owner)",
            },
            sort: {
              type: "string",
              enum: ["created", "updated", "pushed", "full_name"],
              description: "How to sort the repositories (default: full_name)",
            },
            per_page: {
              type: "number",
              description: "Number of repositories per page (default: 30, max: 100)",
            },
          },
          required: ["owner"],
        },
      },
      {
        name: "get_assigned_pull_requests",
        description: "Get pull requests assigned to the authenticated user",
        inputSchema: {
          type: "object",
          properties: {
            state: {
              type: "string",
              enum: ["open", "closed", "all"],
              description: "State of pull requests to fetch (default: open)",
            },
            sort: {
              type: "string",
              enum: ["created", "updated", "comments"],
              description: "How to sort the pull requests (default: created)",
            },
            direction: {
              type: "string",
              enum: ["asc", "desc"],
              description: "Sort direction (default: desc)",
            },
            per_page: {
              type: "number",
              description: "Number of pull requests per page (default: 30, max: 100)",
            },
          },
          required: [],
        },
      },
    ];
  }

  export async function callTool(name: string, args: any) {
    if (name === "list_repositories") {
      return await listRepositories(args);
    }
    if (name === "get_assigned_pull_requests") {
      return await getAssignedPullRequests(args);
    }
    throw new Error(`Unknown GitHub tool: ${name}`);
  }

  async function listRepositories(args: {
    owner: string;
    type?: string;
    sort?: string;
    per_page?: number;
  }) {
    const token = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({ auth: token });

    try {
      const { data } = await octokit.rest.repos.listForUser({
        username: args.owner,
        type: (args.type as any) || "owner",
        sort: (args.sort as any) || "full_name",
        per_page: args.per_page || 30,
      });

      const repositories = data.map((repo) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || "No description",
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || "Unknown",
        private: repo.private,
        updated_at: repo.updated_at,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(repositories, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing repositories: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async function getAssignedPullRequests(args: {
    state?: string;
    sort?: string;
    direction?: string;
    per_page?: number;
  }) {
    const token = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({ auth: token });

    try {
      const { data } = await octokit.rest.issues.listForAuthenticatedUser({
        filter: "assigned",
        state: (args.state as any) || "open",
        sort: (args.sort as any) || "created",
        direction: (args.direction as any) || "desc",
        per_page: args.per_page || 30,
      });

      // Filter to only include pull requests (issues with pull_request property)
      const pullRequests = data
        .filter((issue) => issue.pull_request)
        .map((pr) => ({
          title: pr.title,
          number: pr.number,
          url: pr.html_url,
          repo: pr.repository_url.split("/").slice(-2).join("/"),
          state: pr.state,
          author: pr.user?.login || "Unknown",
          created_at: pr.created_at,
          updated_at: pr.updated_at,
        }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(pullRequests, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching assigned pull requests: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
}
