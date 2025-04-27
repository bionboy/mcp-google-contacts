import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";
import { promises as fs } from "fs";
import { join } from "path";
import { OAuth2Client } from "google-auth-library";

// TODO: fix this hack and make it a portable path
const PROJECT_ROOT = "/Users/bb/github/mine/mcp-server-demo";
const AUTH_PATH = join(PROJECT_ROOT, "auth/google/people-api/");
const TOKEN_PATH = join(AUTH_PATH, "token.json");
const CREDENTIALS_PATH = join(AUTH_PATH, "credentials.json");

const SCOPES = ["https://www.googleapis.com/auth/contacts.readonly"];

/**
 * Reads previously authorized credentials from the save file.
 */
export async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH, "utf8");
    const credentials = JSON.parse(content);
    // return google.auth.fromJSON(credentials);
    return google.auth.fromJSON(credentials) as OAuth2Client;
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 */
async function saveCredentials(client: OAuth2Client) {
  let key;
  try {
    const content = await fs.readFile(CREDENTIALS_PATH, "utf8");
    const keys = JSON.parse(content);
    key = keys.installed || keys.web;
  } catch (err) {
    console.error("Error reading credentials file:", err);
    throw err;
  }

  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 */
export async function initializeAuth() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client && client.credentials) {
    await saveCredentials(client);
  }
  return client;
}
