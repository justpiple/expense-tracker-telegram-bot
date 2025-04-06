import { DateTracker } from "../types";
import { notion } from "../services/notion";
import { NOTION_DB } from "../config/env";

export async function getOrCreateMonthYear(
  dateString: string,
): Promise<DateTracker> {
  try {
    const date = new Date(dateString);
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear().toString();

    const monthYearFormat = `${monthName} ${year}`;

    let monthId;
    let isNewMonth = false;
    const monthResponse = await notion.databases.query({
      database_id: NOTION_DB.MONTH,
      filter: {
        property: "Name",
        title: {
          equals: monthYearFormat,
        },
      },
    });

    if (monthResponse.results.length === 0) {
      const newMonth = await notion.pages.create({
        parent: { database_id: NOTION_DB.MONTH },
        properties: {
          Name: {
            title: [{ text: { content: monthYearFormat } }],
          },
        },
      });
      monthId = newMonth.id;
      isNewMonth = true;
    } else {
      monthId = monthResponse.results[0].id;
    }

    let yearId;
    let isNewYear = false;
    const yearResponse = await notion.databases.query({
      database_id: NOTION_DB.YEAR,
      filter: {
        property: "Name",
        title: {
          equals: year,
        },
      },
    });

    if (yearResponse.results.length === 0) {
      const newYear = await notion.pages.create({
        parent: { database_id: NOTION_DB.YEAR },
        properties: {
          Name: {
            title: [{ text: { content: year } }],
          },
        },
      });
      yearId = newYear.id;
      isNewYear = true;
    } else {
      yearId = yearResponse.results[0].id;
    }

    return {
      monthId,
      yearId,
      isNewMonth,
      isNewYear,
    };
  } catch (error) {
    console.error("Error creating/getting month/year:", error);
    return {};
  }
}
