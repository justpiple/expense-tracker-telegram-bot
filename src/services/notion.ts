import { Client } from "@notionhq/client";
import { NOTION_API_KEY } from "../config/env";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export const notion = new Client({ auth: NOTION_API_KEY });

export function getPageTitle(pageObj: PageObjectResponse): string | null {
  if (!pageObj.properties) return null;

  for (const key in pageObj.properties) {
    const prop = pageObj.properties[key];

    if (prop.type === "title" && prop.title.length > 0) {
      return prop.title[0].plain_text;
    }
  }

  return null;
}
