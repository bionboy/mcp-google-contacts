import { listContacts, searchContacts, formatContact } from "./contacts.js";
import { initializeAuth } from "./Auth.js";

export async function test() {
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
}
