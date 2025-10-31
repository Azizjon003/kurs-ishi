import { MCPClient } from "@mastra/mcp";

export const mcpServers = new MCPClient({
  id: "test-mcp-client",
  servers: {
    "web-search": {
      args: ["-y", "open-websearch@latest"],
      command: "npx",
      env: {
        MODE: "stdio",
        DEFAULT_SEARCH_ENGINE: "duckduckgo",
        ALLOWED_SEARCH_ENGINES: "duckduckgo,bing",
      },
    },
    // "playwright-reader": {
    //   command: "npx",
    //   args: ["-y", "playwright-mcp-server", "--stealth", "--headful"],
    // },
    readability: {
      command: "npx",
      args: ["-y", "@just-every/mcp-read-website-fast"],
    },
  },
});
