import { describe, test, expect } from "bun:test";
import { HelloWorld } from "../src/tools/HelloWorld.ts";

describe("HelloWorld", () => {
  describe("listTools", () => {
    test("should return an array with one tool", () => {
      const tools = HelloWorld.listTools();
      
      expect(tools).toBeArray();
      expect(tools).toHaveLength(1);
    });

    test("should return hello_world tool definition", () => {
      const tools = HelloWorld.listTools();
      const tool = tools[0];
      
      expect(tool.name).toBe("hello_world");
      expect(tool.description).toBe("Returns a simple Hello, World! message");
    });

    test("should have correct input schema", () => {
      const tools = HelloWorld.listTools();
      const tool = tools[0];
      
      expect(tool.inputSchema).toEqual({
        type: "object",
        properties: {},
      });
    });
  });

  describe("callTool", () => {
    test("should return Hello, World! message", () => {
      const result = HelloWorld.callTool("hello_world");
      
      expect(result).toHaveProperty("content");
      expect(result.content).toBeArray();
      expect(result.content).toHaveLength(1);
    });

    test("should return text content type", () => {
      const result = HelloWorld.callTool("hello_world");
      const content = result.content[0];
      
      expect(content.type).toBe("text");
    });

    test("should return correct text", () => {
      const result = HelloWorld.callTool("hello_world");
      const content = result.content[0];
      
      expect(content.text).toBe("Hello, World!");
    });
  });
});
