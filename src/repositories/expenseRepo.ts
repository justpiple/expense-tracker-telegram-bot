import { ExpenseData, ExpenseProcessResult } from "../types";
import { notion } from "../services/notion";
import { NOTION_DB } from "../config/env";
import { getOrCreateMonthYear } from "./dateRepo";
import { findSubcategoryId, createNewSubcategory } from "./categoryRepo";
import { findAccountId } from "./accountRepo";
import { findRecurringPaymentId } from "./recurringPaymentRepo";

export async function addExpenseToNotion(
  expense: ExpenseData,
): Promise<ExpenseProcessResult> {
  try {
    const { monthId, yearId, isNewMonth, isNewYear } =
      await getOrCreateMonthYear(expense.date);

    let subcategoryId: string | undefined | null = undefined;
    let matchedSubcategory: string | undefined = undefined;
    let isNewSubcategory = false;

    if (expense.subcategory) {
      const isNewRequest =
        expense.subcategory.toLowerCase().startsWith("new:") ||
        expense.subcategory.toLowerCase().startsWith("baru:");

      if (isNewRequest) {
        const newCategoryName = expense.subcategory.split(":")[1].trim();
        subcategoryId = await createNewSubcategory(newCategoryName);
        matchedSubcategory = newCategoryName;
        isNewSubcategory = true;
      } else {
        subcategoryId = await findSubcategoryId(expense.subcategory);
        matchedSubcategory = expense.subcategory;
      }
    }

    const accountId = expense.account
      ? await findAccountId(expense.account)
      : undefined;

    const recurringPaymentId = await findRecurringPaymentId(
      expense.description,
    );

    const properties: any = {
      Description: {
        title: [{ text: { content: expense.description } }],
      },
      Amount: {
        number: expense.amount,
      },
      "Date of Expense": {
        date: { start: expense.date },
      },
    };

    if (monthId) properties["Month"] = { relation: [{ id: monthId }] };
    if (yearId) properties["Year"] = { relation: [{ id: yearId }] };

    if (subcategoryId)
      properties["Expenses Sub-categories"] = {
        relation: [{ id: subcategoryId }],
      };

    if (accountId) properties["Accounts"] = { relation: [{ id: accountId }] };

    if (recurringPaymentId)
      properties["Linked Recurring Payment"] = {
        relation: [{ id: recurringPaymentId }],
      };

    if (expense.receipt) {
      properties["Receipt"] = {
        files: [
          {
            name: `Receipt-${new Date().toISOString().split("T")[0]}.jpg`,
            external: {
              url: expense.receipt,
            },
          },
        ],
      };
    }

    const createOptions: any = {
      parent: { database_id: NOTION_DB.EXPENSES },
      properties: properties,
    };

    const response = await notion.pages.create(createOptions);

    return {
      expenseId: response.id,
      matchedSubcategory,
      isNewSubcategory,
      isNewMonth,
      isNewYear,
      success: true,
    };
  } catch (error) {
    console.error("Error adding expense to Notion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
