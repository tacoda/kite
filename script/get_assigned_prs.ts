#!/usr/bin/env bun
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const client = new Client(
    {
      name: "kite-get-assigned-prs-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    },
  );

  const transport = new StdioClientTransport({
    command: "bun",
    args: ["run", "src/index.ts"],
  });

  try {
    await client.connect(transport);
    console.log("Fetching assigned pull requests...\n");

    const result = await client.callTool({
      name: "get_assigned_pull_requests",
      arguments: {
        state: "open",
        sort: "updated",
        direction: "desc",
      },
    });

    result.content.forEach((item) => {
      if (item.type === "text") {
        const prs = JSON.parse(item.text);

        if (prs.length === 0) {
          console.log("No pull requests assigned to you.");
          return;
        }

        console.log(`Found ${prs.length} assigned pull request(s):\n`);
        prs.forEach((pr: any) => {
          console.log(`🔀 #${pr.number}: ${pr.title}`);
          console.log(`   📁 ${pr.repo}`);
          console.log(`   👤 @${pr.author} | 📊 ${pr.state}`);
          console.log(
            `   🕒 Updated: ${new Date(pr.updated_at).toLocaleString()}`,
          );
          console.log(`   ${pr.url}\n`);
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
