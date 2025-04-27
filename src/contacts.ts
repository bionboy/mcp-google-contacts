import { google, people_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const PEOPLE_API_VERSION = "v1";

function getPeopleAPI(auth: OAuth2Client) {
  return google.people({ version: PEOPLE_API_VERSION, auth });
}

export function formatContact(contact: people_v1.Schema$Person) {
  const data = {
    name: contact.names?.[0]?.displayName || null,
    emails: contact.emailAddresses?.map((e) => e.value) || [],
    phones: contact.phoneNumbers?.map((p) => p.value) || [],
  };
  return `${JSON.stringify(data)}`;
}

export async function listContacts(auth: OAuth2Client) {
  const peopleAPI = getPeopleAPI(auth);

  const response = await peopleAPI.people.connections.list({
    resourceName: "people/me",
    personFields: "names,emailAddresses,phoneNumbers",
  });
  return response.data.connections || [];
}

export async function searchContacts(auth: OAuth2Client, query: string) {
  const peopleAPI = getPeopleAPI(auth);

  const response = await peopleAPI.people.searchContacts({
    query,
    readMask: "names,emailAddresses,phoneNumbers",
  });
  const results = response.data.results?.map((r) => r.person);
  return (results || []) as people_v1.Schema$Person[];
}
