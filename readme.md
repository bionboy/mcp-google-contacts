# Google Contacts MCP Server

## Usage

### Setup

> [!NOTE]
> You will have to set up a Google Cloud project and enable the Google Contacts API, as well as obtain credentials (`credentials.json`)

```sh
pnpm install
pnpm build
```

Add this to your client of choice (e.g. Cursor):

> If you are running locally in a project this would go in `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "google-contacts": {
      "command": "node",
      "args": ["./build/index.js"]
    }
  }
}
```

### Authentication

The first time your client tries to use any of the tools, it will open a browser window to authenticate you.

> [!WARNING]
> If you are operating with a google app that is not published or is in testing, you will have to add user emails to the testing list on GCP.
