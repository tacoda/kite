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
    ];
  }

  export async function callTool(name: string, args: any) {
    if (name === "list_repositories") {
      return await listRepositories(args);
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
}
