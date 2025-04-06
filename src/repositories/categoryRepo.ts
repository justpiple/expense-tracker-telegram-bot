import { Subcategory } from "../types";
import { notion, getPageTitle } from "../services/notion";
import { NOTION_DB } from "../config/env";
import { CACHE_TTL } from "../config/constants";

let subcategoriesCache: Subcategory[] = [];
let lastSubcategoriesFetch: number = 0;

export async function fetchAllSubcategories(): Promise<Subcategory[]> {
  try {
    const now = Date.now();
    if (
      subcategoriesCache.length > 0 &&
      now - lastSubcategoriesFetch < CACHE_TTL
    ) {
      return subcategoriesCache;
    }

    const subcategories: Subcategory[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: NOTION_DB.SUBCATEGORIES,
        start_cursor: startCursor,
      });

      for (const page of response.results) {
        const title = getPageTitle(page as any);
        if (title) {
          subcategories.push({
            id: page.id,
            name: title,
          });
        }
      }

      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    subcategoriesCache = subcategories;
    lastSubcategoriesFetch = now;

    return subcategories;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
}

export async function findSubcategoryId(
  name: string,
): Promise<string | undefined> {
  try {
    if (!name || name.trim() === "") return undefined;

    const searchTerm = name.toLowerCase().trim();
    const subcategories = await fetchAllSubcategories();

    // Try exact match first
    const exactMatch = subcategories.find(
      (cat) => cat.name.toLowerCase() === searchTerm,
    );
    if (exactMatch) return exactMatch.id;

    // Try contains match
    const containsMatch = subcategories.find(
      (cat) =>
        cat.name.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(cat.name.toLowerCase()),
    );
    if (containsMatch) return containsMatch.id;

    // Try word match
    for (const word of searchTerm.split(/\s+/)) {
      if (word.length < 3) continue;

      const wordMatch = subcategories.find((cat) =>
        cat.name.toLowerCase().includes(word),
      );
      if (wordMatch) return wordMatch.id;
    }

    return undefined;
  } catch (error) {
    console.error("Error finding subcategory:", error);
    return undefined;
  }
}

export async function createNewSubcategory(
  name: string,
): Promise<string | null> {
  try {
    const response = await notion.pages.create({
      parent: { database_id: NOTION_DB.SUBCATEGORIES },
      properties: {
        Name: {
          title: [{ text: { content: name } }],
        },
      },
    });

    subcategoriesCache = [];

    return response.id;
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return null;
  }
}

export function getAllCategoryNames(): Promise<string[]> {
  return fetchAllSubcategories().then((categories) =>
    categories.map((cat) => cat.name),
  );
}
