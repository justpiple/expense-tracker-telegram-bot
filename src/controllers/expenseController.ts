import { Context, NarrowedContext } from "telegraf";
import {
  ExpenseData,
  ExpenseProcessResult,
  MultiExpenseResult,
} from "../types";
import { extractExpensesWithAI, uploadToGemini } from "../services/ai";
import { addExpenseToNotion } from "../repositories/expenseRepo";
import { getAllCategoryNames } from "../repositories/categoryRepo";
import { getAllAccountNames, findAccountId } from "../repositories/accountRepo";
import { BOT_MESSAGES } from "../config/constants";
import { Message, Update } from "@telegraf/types";
import { messageService } from "../utils/message";
import { FileData } from "@google/generative-ai";
import { uploadImageToImgbb } from "../services/imgbb";

type MessageContext = NarrowedContext<
  Context<Update>,
  Update.MessageUpdate<Record<"text", {}> & Message.TextMessage>
>;

async function validateExpensesAccounts(
  ctx: Context,
  expenses: ExpenseData[],
  accounts: string[]
): Promise<boolean> {
  const missingAccounts = expenses.filter((exp) => !exp.account);
  if (missingAccounts.length > 0) {
    const accountOptions = accounts.join(", ");
    await ctx.reply(`${BOT_MESSAGES.ACCOUNT_MISSING}${accountOptions}`);
    return false;
  }

  for (const expense of expenses) {
    if (expense.account) {
      const accountId = await findAccountId(expense.account);
      if (!accountId) {
        await ctx.reply(
          BOT_MESSAGES.ACCOUNT_NOT_FOUND(expense.account, accounts)
        );
        return false;
      }
    }
  }

  return true;
}

const expenseProcessing = {
  async handleSingleExpense(ctx: Context, expense: ExpenseData) {
    const prelimMsg = await messageService.sendPreliminaryMessage(ctx, expense);

    const result = await addExpenseToNotion(expense);

    if (result.success) {
      await messageService.sendSuccessMessage(
        ctx,
        prelimMsg?.message_id,
        expense,
        result
      );

      if (
        expense.subcategory &&
        !result.isNewSubcategory &&
        !result.matchedSubcategory
      ) {
        setTimeout(() => {
          messageService.sendSubcategoryWarningMessage(
            ctx,
            expense.subcategory!
          );
        }, 1000);
      }
    } else {
      messageService.sendErrorMessage(ctx, prelimMsg?.message_id);
    }
  },

  async handleMultipleExpenses(
    ctx: Context,
    expenses: ExpenseData[]
  ): Promise<void> {
    const msg = await ctx.reply(
      `⏳ Memproses ${expenses.length} pengeluaran...`
    );

    const results: ExpenseProcessResult[] = [];
    for (const expense of expenses) {
      const result = await addExpenseToNotion(expense);
      results.push(result);
    }

    const summary: MultiExpenseResult = {
      successes: results.filter((r) => r.success).length,
      failures: results.filter((r) => !r.success).length,
      expenses: results,
    };

    await messageService.sendMultiExpenseSummary(
      ctx,
      msg.message_id,
      expenses,
      summary
    );
  },
};

export const expenseController = {
  handleTextMessage: async (ctx: MessageContext) => {
    const message = ctx.message.text;

    if (!message) return;

    ctx.telegram.sendChatAction(ctx.chat.id, "typing");

    const [categories, accounts] = await Promise.all([
      getAllCategoryNames(),
      getAllAccountNames(),
    ]);

    const { expenses, ...result } = await extractExpensesWithAI({
      message,
      categories,
      accounts,
    });

    if (expenses.length === 0) {
      await ctx.reply(result.message || BOT_MESSAGES.NOT_EXPENSE_MESSAGE);
      return;
    }

    if (!(await validateExpensesAccounts(ctx, expenses, accounts))) return;

    if (expenses.length > 1) {
      await expenseProcessing.handleMultipleExpenses(ctx, expenses);
    } else {
      await expenseProcessing.handleSingleExpense(ctx, expenses[0]);
    }
  },

  handlePhotoMessage: async (ctx: Context) => {
    const message = ctx.message;

    if (!message || !("photo" in message) || !message.photo) {
      await ctx.reply(BOT_MESSAGES.PHOTO_PROCESSING_ERROR);
      return;
    }

    const caption = message.caption;

    if (!caption) {
      await ctx.reply(BOT_MESSAGES.PHOTO_MISSING_CAPTION);
      return;
    }

    const photo = message.photo[message.photo.length - 1];

    if (!photo) {
      await ctx.reply(BOT_MESSAGES.PHOTO_PROCESSING_ERROR);
      return;
    }

    await ctx.telegram.sendChatAction(ctx.chat!.id, "typing");

    const fileLink = await ctx.telegram.getFileLink(photo.file_id);
    const photoUrl = fileLink.href;

    const fetchPhoto = await fetch(photoUrl);

    if (!fetchPhoto.ok) {
      throw new Error(
        `Failed to fetch Photo: Status code ${fetchPhoto.status}`
      );
    }

    const photoArrayBuffer = await fetchPhoto.arrayBuffer();
    const photoBuffer = Buffer.from(photoArrayBuffer);

    const [categories, accounts] = await Promise.all([
      getAllCategoryNames(),
      getAllAccountNames(),
    ]);

    const [file, receiptUrl] = await Promise.all([
      uploadToGemini(photoBuffer, "image/jpeg"),
      uploadImageToImgbb(photoBuffer, "image/jpeg").catch((error) => {
        console.error("Failed to upload receipt to imgbb:", error);
        return undefined;
      }),
    ]);

    const fileData: FileData = { mimeType: file.mimeType, fileUri: file.uri };
    const result = await extractExpensesWithAI({
      message: caption,
      categories,
      accounts,
      fileData,
    });

    if (result.expenses.length === 0) {
      await ctx.reply(result.message || BOT_MESSAGES.EXPENSE_FAILURE);
      return;
    }

    const expenses = result.expenses;

    if (!(await validateExpensesAccounts(ctx, result.expenses, accounts)))
      return;

    if (receiptUrl && expenses.length > 0) {
      expenses[0].receipt = receiptUrl;
    }

    if (expenses.length > 1) {
      await expenseProcessing.handleMultipleExpenses(ctx, expenses);
    } else {
      await expenseProcessing.handleSingleExpense(ctx, expenses[0]);
    }
  },
};
