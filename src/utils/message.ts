import { Context } from "telegraf";
import {
  ExpenseData,
  ExpenseProcessResult,
  MultiExpenseResult,
} from "../types";
import { formatCurrency, formatFriendlyDate } from "./date";
import { BOT_MESSAGES } from "../config/constants";

export const messageFormatter = {
  formatExpenseSummary(expense: ExpenseData): string {
    const amount = formatCurrency(expense.amount);
    const date = formatFriendlyDate(expense.date);

    return `📝 ${expense.description}
💰 ${amount}
📅 ${date}
${expense.subcategory ? `🏷️ Kategori: ${expense.subcategory}` : ""}
${expense.account ? `💳 Pakai: ${expense.account}` : ""}
${expense.receipt ? "📷 Dengan foto struk" : ""}`;
  },

  formatMultiExpenseSummary(
    expenses: ExpenseData[],
    results: MultiExpenseResult,
  ): string[] {
    const successCount = results.successes;
    const failureCount = results.failures;

    const summaryText = [
      `✅ Berhasil mencatat ${successCount} dari ${expenses.length} pengeluaran!`,
      "",
      "📊 *Ringkasan Pengeluaran:*",
    ];

    expenses.forEach((expense, index) => {
      const result = results.expenses[index];
      const status = result.success ? "✅" : "❌";
      const formattedAmount = formatCurrency(expense.amount);
      const accountText = expense.account ? `(${expense.account})` : "";

      summaryText.push(
        `${status} ${expense.description} - ${formattedAmount} ${accountText}`,
      );
    });

    if (failureCount > 0) {
      summaryText.push(
        "",
        "⚠️ Beberapa pengeluaran gagal dicatat. Mohon coba lagi atau periksa formatnya.",
      );
    }

    return summaryText;
  },
};

export const messageService = {
  sendPreliminaryMessage(ctx: Context, expense: ExpenseData) {
    return ctx.reply(`
📋 Catatan pengeluaran kamu lagi diproses nih...

💬 Detailnya:
${messageFormatter.formatExpenseSummary(expense)}

⏳ Tunggu sebentar ya, lagi disimpan ke Notion...
    `);
  },

  async sendSuccessMessage(
    ctx: Context,
    messageId: number | undefined,
    expense: ExpenseData,
    result: ExpenseProcessResult,
  ) {
    if (!messageId) return;

    let monthYearText = "";
    if (result.isNewMonth) {
      monthYearText += `🆕 Bulan baru ditambahkan\n`;
    }
    if (result.isNewYear) {
      monthYearText += `🆕 Tahun baru ditambahkan\n`;
    }

    await ctx.telegram.editMessageText(
      ctx.chat!.id,
      messageId,
      undefined,
      `
✅ Oke, pengeluaran kamu sudah dicatat!

${messageFormatter.formatExpenseSummary(expense)}
${monthYearText}
📊 Data sudah masuk ke Notion.
      `,
    );
  },

  sendSubcategoryWarningMessage(ctx: Context, subcategory: string) {
    ctx.reply(`
⚠️ Hmm, kategori "${subcategory}" sepertinya belum ada di database kita.

Mau lihat kategori yang tersedia? Coba ketik /categories ya!

Tips: Kamu juga bisa buat kategori baru dengan format:
"new: Nama Kategori" atau "baru: Nama Kategori"
    `);
  },

  sendErrorMessage(ctx: Context, messageId: number | undefined) {
    if (!messageId) return;

    ctx.telegram.editMessageText(
      ctx.chat!.id,
      messageId,
      undefined,
      BOT_MESSAGES.EXPENSE_ERROR,
    );
  },

  async sendMultiExpenseSummary(
    ctx: Context,
    messageId: number,
    expenses: ExpenseData[],
    results: MultiExpenseResult,
  ) {
    const summaryText = messageFormatter.formatMultiExpenseSummary(
      expenses,
      results,
    );

    await ctx.telegram.editMessageText(
      ctx.chat!.id,
      messageId,
      undefined,
      summaryText.join("\n"),
      { parse_mode: "Markdown" },
    );
  },
};

export function escapeMarkdown(text: string) {
  return text.replace(/[_*[\]()~`>#\\+\-=|{}.!]/g, "\\$&");
}
