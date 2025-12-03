import { HelloWorld } from "./HelloWorld.ts";
import { GitHub } from "./GitHub.ts";

export namespace Tools {
  export function list() {
    return [...HelloWorld.listTools(), ...GitHub.listTools()];
  }

  export async function call(params: {}) {
    if (params.name === "hello_world") {
      return HelloWorld.callTool(params.name);
    }

    if (params.name === "list_repositories") {
      return await GitHub.callTool(params.name, params.arguments);
    }

    if (params.name === "get_assigned_pull_requests") {
      return await GitHub.callTool(params.name, params.arguments);
    }

    throw new Error(`Unknown tool: ${params.name}`);
  }
}
