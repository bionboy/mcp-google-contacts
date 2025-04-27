import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export async function listContacts(auth: OAuth2Client) {
  const peopleAPI = google.people({ version: "v1", auth });

  const response = await peopleAPI.people.connections.list({
    resourceName: "people/me",
    personFields: "names,emailAddresses,phoneNumbers",
  });
  return response.data.connections || [];
}
