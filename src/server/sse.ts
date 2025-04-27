import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import server from "./index.js";

export function runSSEServer() {
  const app = express();

  let transport: SSEServerTransport | null = null;

  app.get("/sse", (req, res) => {
    transport = new SSEServerTransport("/messages", res);
    server.connect(transport);
  });

  app.post("/messages", (req, res) => {
    if (transport) {
      transport.handlePostMessage(req, res);
    }
  });

  app.listen(3000);

  return app;
}
