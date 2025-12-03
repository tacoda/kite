export namespace HelloWorld {
  export function listTools() {
    return [
      {
        name: "hello_world",
        description: "Returns a simple Hello, World! message",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ];
  }

  export function callTool(name: string) {
    return {
      content: [
        {
          type: "text",
          text: "Hello, World!",
        },
      ],
    };
  }
}
