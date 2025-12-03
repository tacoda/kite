# :kite: Kite MCP Server

An MCP (Model Context Protocol) server with tools for interacting with GitHub and more.

## Installation

```bash
bun install
```

## Setup Credentials

For GitHub tools, you'll need a GitHub Personal Access Token:

```bash
cp .env.example .env
# Add your GitHub token to .env:
# GITHUB_TOKEN=your_github_token_here
```

## Running

```bash
bun start
```

## Testing

```bash
bun test
```

## Invoking Tools

```bash
# Hello World example
bun run script/hello_world.ts

# List GitHub repositories
bun run script/list_repos.ts <github-username>

# Get assigned pull requests (requires GITHUB_TOKEN)
bun run script/get_assigned_prs.ts
```

## Tools

### hello_world

Returns "Hello, World!"

**Input:** None

**Output:** Text response with "Hello, World!"

### list_repositories

List GitHub repositories for a user or organization.

**Input:**
- `owner` (required): GitHub username or organization name
- `type` (optional): Type of repositories - "all", "owner", or "member" (default: "owner")
- `sort` (optional): Sort by "created", "updated", "pushed", or "full_name" (default: "full_name")
- `per_page` (optional): Number of repositories per page, max 100 (default: 30)

**Output:** JSON array of repositories with name, description, URL, stars, forks, language, and timestamps.

### get_assigned_pull_requests

Get pull requests assigned to the authenticated user.

**Input:**
- `state` (optional): State of pull requests - "open", "closed", or "all" (default: "open")
- `sort` (optional): Sort by "created", "updated", or "comments" (default: "created")
- `direction` (optional): Sort direction - "asc" or "desc" (default: "desc")
- `per_page` (optional): Number of pull requests per page, max 100 (default: 30)

**Output:** JSON array of pull requests with title, number, URL, repo, state, author, and timestamps.

**Note:** Requires `GITHUB_TOKEN` environment variable to be set.

## Adding More Tools

To add additional tools:

1. Add the tool definition in the `ListToolsRequestSchema` handler
2. Add the tool implementation in the `CallToolRequestSchema` handler

Example:

```typescript
// In ListToolsRequestSchema handler
{
  name: "my_tool",
  description: "Description of what this tool does",
  inputSchema: {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "Description of param1"
      }
    },
    required: ["param1"]
  }
}

// In CallToolRequestSchema handler
if (request.params.name === "my_tool") {
  const { param1 } = request.params.arguments;
  return {
    content: [
      {
        type: "text",
        text: `Processed: ${param1}`
      }
    ]
  };
}
```
