import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listContacts } from "./contacts.js";
import { initializeAuth } from "./Auth.js";

const server = new McpServer({
  name: "google-contacts",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool("list contacts", "lists google contacts", async () => {
  const auth = await initializeAuth();
  const contacts = await listContacts(auth);
  return {
    content: [
      {
        type: "text",
        text: `Found ${contacts.length} contacts`,
      },
      {
        type: "text",
        text: `${contacts}`,
      },
    ],
  };
});

async function main() {
  if (process.argv.includes("--test-no-mcp")) {
    console.log("Running in test mode...");
    const auth = await initializeAuth();
    const contacts = await listContacts(auth);
    console.log("Found contacts:", contacts.length);
    console.log("First contact:", contacts[0]);
    return;
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Contacts MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
