import { Context } from "telegraf";
import { BOT_MESSAGES } from "../config/constants";
import { fetchAllSubcategories } from "../repositories/categoryRepo";
import { fetchAllAccounts } from "../repositories/accountRepo";
import { escapeMarkdown } from "../utils/message";

export const commandController = {
  handleStart: (ctx: Context) => {
    ctx.replyWithMarkdownV2(BOT_MESSAGES.WELCOME);
  },

  handleHelp: (ctx: Context) => {
    ctx.replyWithMarkdownV2(BOT_MESSAGES.HELP);
  },

  handleCategories: async (ctx: Context) => {
    try {
      ctx.telegram.sendChatAction(ctx.chat!.id, "typing");

      const subcategories = await fetchAllSubcategories();

      if (subcategories.length === 0) {
        ctx.reply("❌ Tidak ada kategori yang ditemukan di database.");
        return;
      }

      subcategories.sort((a, b) => a.name.localeCompare(b.name));

      const message = [
        "📋 *Daftar Kategori Tersedia:*",
        "",
        ...subcategories.map(
          (cat, i) => `${i + 1}\\. ${escapeMarkdown(cat.name)}`,
        ),
        "",
        "💡 *Tips:*",
        "_Gunakan nama kategori saat mencatat pengeluaran\\._",
        "Untuk membuat kategori baru, gunakan format: `new: Nama Kategori`",
      ].join("\n");

      ctx.replyWithMarkdownV2(message);
    } catch (error) {
      console.error("Error fetching categories:", error);
      ctx.reply(BOT_MESSAGES.CATEGORIES_FETCH_ERROR);
    }
  },

  handleAccounts: async (ctx: Context) => {
    try {
      ctx.telegram.sendChatAction(ctx.chat!.id, "typing");

      const accounts = await fetchAllAccounts();

      if (accounts.length === 0) {
        ctx.reply("❌ Tidak ada akun yang ditemukan di database.");
        return;
      }

      accounts.sort((a, b) => a.name.localeCompare(b.name));

      const message = [
        "💳 *Daftar Akun Pembayaran Tersedia:*",
        "",
        ...accounts.map((acc, i) => `${i + 1}\\. ${escapeMarkdown(acc.name)}`),
        "",
        "💡 *Tips:*",
        "_Sebutkan akun pembayaran saat mencatat pengeluaran\\._",
        "Contoh penggunaan: `via BCA`, `pakai Dana`, atau `dengan Mandiri`",
      ].join("\n");

      ctx.replyWithMarkdownV2(message);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      ctx.reply("❌ Gagal mengambil daftar akun. Silakan coba lagi nanti.");
    }
  },
};
