import { notion } from "../services/notion";
import { NOTION_DB } from "../config/env";

export async function findRecurringPaymentId(
  description: string,
): Promise<string | undefined> {
  try {
    if (!description || description.trim() === "") return undefined;

    const response = await notion.databases.query({
      database_id: NOTION_DB.RECURRING_PAYMENTS,
      filter: {
        property: "Name",
        title: {
          contains: description.toLowerCase().trim(),
        },
      },
    });

    if (response.results.length > 0) return response.results[0].id;
    return undefined;
  } catch (error) {
    console.error("Error finding recurring payment:", error);
    return undefined;
  }
}
