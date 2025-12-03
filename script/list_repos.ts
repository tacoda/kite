#!/usr/bin/env bun
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const owner = process.argv[2];
  
  if (!owner) {
    console.error("Usage: bun script/list_repos.ts <github-username>");
    process.exit(1);
  }

  const client = new Client(
    {
      name: "kite-list-repos-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  const transport = new StdioClientTransport({
    command: "bun",
    args: ["run", "src/index.ts"],
  });

  try {
    await client.connect(transport);
    console.log(`Fetching repositories for ${owner}...\n`);

    const result = await client.callTool({
      name: "list_repositories",
      arguments: {
        owner,
        sort: "updated",
        per_page: 10,
      },
    });

    result.content.forEach((item) => {
      if (item.type === "text") {
        const repos = JSON.parse(item.text);
        console.log(`Found ${repos.length} repositories:\n`);
        repos.forEach((repo: any) => {
          console.log(`📦 ${repo.full_name}`);
          console.log(`   ${repo.description}`);
          console.log(`   ⭐ ${repo.stars} | 🍴 ${repo.forks} | 💻 ${repo.language}`);
          console.log(`   ${repo.url}\n`);
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
