import { Telegraf } from "telegraf";
import { TELEGRAM_BOT_TOKEN } from "../config/env";
import { message } from "telegraf/filters";
import { commandController } from "../controllers/commandController";
import { expenseController } from "../controllers/expenseController";
import { userController } from "../controllers/userController";
import { userService } from "../services/user";

import { isRegisteredUser } from "../middlewares/authMiddleware";
import { setupReminderScheduler } from "../utils/schedulers";

export const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

export function setupBot() {
  bot.start(async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) {
      return ctx.reply(
        "Tidak dapat mengidentifikasi ID pengguna. Silakan coba lagi.",
      );
    }

    try {
      const isRegistered = await userService.isUserRegistered(userId);
      if (isRegistered) {
        return commandController.handleStart(ctx);
      } else {
        return userController.startRegistration(ctx);
      }
    } catch (error) {
      console.error("Error handling start command:", error);
      return ctx.reply("Terjadi kesalahan. Silakan coba lagi.");
    }
  });

  bot.use(isRegisteredUser);
  bot.help(commandController.handleHelp);

  bot.action("start_registration", userController.handleRegistrationStart);
  bot.action("show_categories", (ctx) => {
    ctx.answerCbQuery();
    return commandController.handleCategories(ctx);
  });
  bot.action("show_accounts", (ctx) => {
    ctx.answerCbQuery();
    return commandController.handleAccounts(ctx);
  });
  bot.action("record_expense", (ctx) => {
    ctx.answerCbQuery();
    return ctx.reply("Silakan kirim detail pengeluaran Anda.");
  });

  bot.command("categories", commandController.handleCategories);
  bot.command("accounts", commandController.handleAccounts);

  bot.on(message("text"), async (ctx) => {
    if (ctx.message.text.startsWith("/")) return;

    const telegramId = ctx.from?.id;
    if (!telegramId) {
      return ctx.reply("Tidak dapat mengidentifikasi Anda. Silakan coba lagi.");
    }

    const isRegistered = await userService.isUserRegistered(telegramId);
    if (!isRegistered) {
      return userController.startRegistration(ctx);
    }

    await expenseController.handleTextMessage(ctx);
  });

  bot.on(
    message("photo"),
    isRegisteredUser,
    expenseController.handlePhotoMessage,
  );

  setupReminderScheduler(bot);

  return bot
    .launch(() => console.log("Bot is running!"))
    .catch((err) => {
      console.error("Failed to start bot:", err);
    });
}

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
