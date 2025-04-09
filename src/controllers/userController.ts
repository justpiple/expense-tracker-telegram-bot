import { Context, Markup, Telegraf } from "telegraf";
import { REGISTER_SECRET_CODE } from "../config/env";
import { userService } from "../services/user";

export const userController = {
  startRegistration: async (ctx: Context) => {
    return ctx.reply(
      "Selamat datang! Untuk mengakses fitur bot, Anda perlu mendaftar terlebih dahulu.",
      Markup.inlineKeyboard([
        Markup.button.callback("Daftar Sekarang", "start_registration"),
      ]),
    );
  },

  handleRegistrationStart: async (ctx: Context) => {
    await ctx.answerCbQuery();

    return ctx.reply("Silakan masukkan secret code untuk mendaftar:", {
      reply_markup: { force_reply: true },
    });
  },

  handleSecretCode: async (ctx: Context) => {
    if (!ctx.message || !("text" in ctx.message)) {
      return;
    }

    const secretCode = ctx.message.text;
    const telegramId = ctx.from?.id;

    if (!telegramId) {
      return ctx.reply(
        "Tidak dapat mengidentifikasi ID pengguna. Silakan coba lagi.",
      );
    }

    if (secretCode !== REGISTER_SECRET_CODE) {
      return ctx.reply(
        "Secret code salah. Silakan coba lagi.",
        Markup.inlineKeyboard([
          Markup.button.callback("Coba Lagi", "start_registration"),
        ]),
      );
    }

    const username = ctx.from?.username ?? "unknown";
    const firstName = ctx.from?.first_name ?? "";
    const lastName = ctx.from?.last_name ?? "";

    const result = await userService.registerUser(
      telegramId,
      username,
      firstName,
      lastName,
    );

    if (result.success) {
      console.log(
        `User berhasil terdaftar: ID ${telegramId}, Username: ${username}`,
      );
      return ctx.reply(
        "Registrasi berhasil! Anda sekarang dapat mengakses semua fitur bot dan akan menerima pengingat pengeluaran harian.",
        Markup.inlineKeyboard([
          Markup.button.callback("Lihat Kategori", "show_categories"),
          Markup.button.callback("Lihat Akun", "show_accounts"),
        ]),
      );
    } else {
      console.error(
        `Registrasi gagal untuk user ID ${telegramId}: ${result.message}`,
      );
      return ctx.reply(`Registrasi gagal: ${result.message}`);
    }
  },

  isReplyToBot: (message: any): boolean => {
    if (!message) return false;

    return !!(
      message.reply_to_message?.from?.is_bot &&
      message.reply_to_message?.text?.includes("Silakan masukkan secret code")
    );
  },

  sendDailyReminder: async (bot: Telegraf, telegramId: number) => {
    try {
      await bot.telegram.sendMessage(
        telegramId,
        "Reminder: Apakah Anda sudah mencatat pengeluaran hari ini? 💸",
        Markup.inlineKeyboard([
          Markup.button.callback("Catat Sekarang", "record_expense"),
        ]),
      );
      console.log(`Reminder sent to user ${telegramId}`);
      return true;
    } catch (error) {
      console.error(`Error sending reminder to user ${telegramId}:`, error);
      return false;
    }
  },
};
