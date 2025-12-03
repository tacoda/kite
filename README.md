# :kite: Kite MCP Server

A simple MCP (Model Context Protocol) server with a `hello_world` tool.

## Installation

```bash
bun install
```

## Setup Credentials

```bash
cp .env.example .env
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
bun run script/hello_world.ts

```

## Tools

### hello_world

Returns "Hello, World!"

**Input:** None

**Output:** Text response with "Hello, World!"

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
