import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

let auth: OAuth2Client | null = null;

export async function initializeAuth(credentials: any) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  return auth;
}

export async function getAuthUrl() {
  if (!auth) throw new Error("Auth not initialized");
  return auth.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/contacts.readonly"],
  });
}

export async function setCredentials(code: string) {
  if (!auth) throw new Error("Auth not initialized");
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);
  return tokens;
}

export async function listContacts() {
  if (!auth) throw new Error("Auth not initialized");
  const people = google.people({ version: "v1", auth });
  const response = await people.people.connections.list({
    resourceName: "people/me",
    personFields: "names,emailAddresses,phoneNumbers",
  });
  return response.data.connections || [];
}
