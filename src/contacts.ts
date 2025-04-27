import { google } from "googleapis";

export async function listContacts() {
  // if (!auth) throw new Error("Auth not initialized");
  // const peopleAPI = google.people({ version: "v1", auth });
  const peopleAPI = google.people({ version: "v1" });

  const response = await peopleAPI.people.connections.list({
    resourceName: "people/me",
    personFields: "names,emailAddresses,phoneNumbers",
  });
  return response.data.connections || [];
}
