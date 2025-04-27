import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listContacts, searchContacts, formatContact } from "./contacts.js";
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
        text: contacts.map(formatContact).join("\n"),
      },
    ],
  };
});

server.tool(
  "search contacts",
  "searches google contacts",
  {
    query: z.string().describe("The contacts' name, number, etc. used to search for the contact"),
  },
  async ({ query }) => {
    const auth = await initializeAuth();
    const contacts = await searchContacts(auth, query);
    return {
      content: [
        {
          type: "text",
          text: contacts.map(formatContact).join("\n"),
        },
      ],
    };
  }
);

async function main() {
  if (process.argv.includes("--test-no-mcp")) {
    console.log("Running in test mode...");
    const auth = await initializeAuth();

    const contacts = await listContacts(auth);
    console.log("Found contacts:", contacts.length);
    console.log("First 5 contacts:", contacts.slice(0, 5));
    console.log("first result formatted:", formatContact(contacts[0]));
    console.log("--------------------------------");

    const searchResults = await searchContacts(auth, "smith");
    console.log("Search results:", searchResults.length);
    console.log("First 5 search results:", searchResults.slice(0, 5));
    console.log("first result formatted:", formatContact(searchResults[0]));
    console.log("--------------------------------");

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
