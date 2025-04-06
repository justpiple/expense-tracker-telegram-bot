import { Telegraf } from "telegraf";
import { TELEGRAM_BOT_TOKEN } from "../config/env";
import { message } from "telegraf/filters";
import { commandController } from "../controllers/commandController";
import { expenseController } from "../controllers/expenseController";

export const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

export function setupBot() {
  bot.start(commandController.handleStart);
  bot.help(commandController.handleHelp);
  bot.command("categories", commandController.handleCategories);
  bot.command("accounts", commandController.handleAccounts);

  bot.on(message("text"), async (ctx) => {
    if (ctx.message.text.startsWith("/")) return;
    await expenseController.handleTextMessage(ctx);
  });

  bot.on(message("photo"), expenseController.handlePhotoMessage);

  return bot
    .launch(() => console.log("Bot is running!"))
    .catch((err) => {
      console.error("Failed to start bot:", err);
    });
}

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
