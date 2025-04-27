import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { initializeAuth, getAuthUrl, setCredentials, listContacts } from "./contacts.js";

// Create server instance
const server = new McpServer({
  name: "google-contacts",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register contacts tools
server.tool(
  "initialize-auth",
  "Initialize Google Contacts authentication",
  {
    credentials: z.any().describe("Google OAuth credentials JSON"),
  },
  async ({ credentials }) => {
    await initializeAuth(credentials);
    return {
      content: [{ type: "text", text: "Auth initialized successfully" }],
    };
  }
);

server.tool("get-auth-url", "Get Google OAuth URL", {}, async () => {
  const url = await getAuthUrl();
  return {
    content: [{ type: "text", text: url }],
  };
});

server.tool(
  "set-credentials",
  "Set OAuth credentials using authorization code",
  {
    code: z.string().describe("Authorization code from OAuth flow"),
  },
  async ({ code }) => {
    const tokens = await setCredentials(code);
    return {
      content: [{ type: "text", text: "Credentials set successfully" }],
    };
  }
);

server.tool("list-contacts", "List Google Contacts", {}, async () => {
  const contacts = await listContacts();
  return {
    content: [{ type: "text", text: JSON.stringify(contacts, null, 2) }],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Contacts MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
