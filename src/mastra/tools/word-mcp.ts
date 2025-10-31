import { MCPClient } from "@mastra/mcp";

export const wordMcp = new MCPClient({
  id: "word-mcp",
  servers: {
    "Office-Word-MCP-Server": {
      command: "uvx",
      args: ["--from", "office-word-mcp-server", "word_mcp_server.exe"],
      env: { MODE: "stdio" },
    },
  },
});
