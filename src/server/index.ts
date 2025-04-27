import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { listContacts, searchContacts, formatContact } from "../contacts.js";
import { initializeAuth } from "../Auth.js";

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

export default server;
