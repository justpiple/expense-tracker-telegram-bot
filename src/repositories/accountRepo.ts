import { Account } from "../types";
import { notion, getPageTitle } from "../services/notion";
import { NOTION_DB } from "../config/env";
import { CACHE_TTL } from "../config/constants";

let accountsCache: Account[] = [];
let lastAccountsFetch: number = 0;

export async function fetchAllAccounts(): Promise<Account[]> {
  try {
    const now = Date.now();
    if (accountsCache.length > 0 && now - lastAccountsFetch < CACHE_TTL) {
      return accountsCache;
    }

    const accounts: Account[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: NOTION_DB.ACCOUNTS,
        start_cursor: startCursor,
      });

      for (const page of response.results) {
        const title = getPageTitle(page as any);
        if (title) {
          accounts.push({
            id: page.id,
            name: title,
          });
        }
      }

      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    accountsCache = accounts;
    lastAccountsFetch = now;

    return accounts;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }
}

export async function findAccountId(name: string): Promise<string | undefined> {
  try {
    if (!name || name.trim() === "") return undefined;

    const searchTerm = name.toLowerCase().trim();
    const accounts = await fetchAllAccounts();

    // First try exact match
    const exactMatch = accounts.find(
      (acc) => acc.name.toLowerCase() === searchTerm,
    );
    if (exactMatch) return exactMatch.id;

    // Then try contains match
    const containsMatch = accounts.find(
      (acc) =>
        acc.name.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(acc.name.toLowerCase()),
    );
    if (containsMatch) return containsMatch.id;

    return undefined;
  } catch (error) {
    console.error("Error finding account:", error);
    return undefined;
  }
}

export function getAllAccountNames(): Promise<string[]> {
  return fetchAllAccounts().then((accounts) => accounts.map((acc) => acc.name));
}
