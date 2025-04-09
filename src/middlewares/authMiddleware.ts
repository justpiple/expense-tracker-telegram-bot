import { Context, Middleware, Markup } from "telegraf";
import { userService } from "../services/user";
import { userController } from "../controllers/userController";

export const isRegisteredUser: Middleware<Context> = async (ctx, next) => {
  if (ctx.callbackQuery && "data" in ctx.callbackQuery) {
    const allowedActions = ["start_registration"];

    if (allowedActions.includes(ctx.callbackQuery.data)) {
      return next();
    }
  }

  if (userController.isReplyToBot(ctx.message)) {
    return userController.handleSecretCode(ctx);
  }

  if (
    ctx.message &&
    "text" in ctx.message &&
    ctx.message.text.startsWith("/")
  ) {
    const allowedCommands = ["start", "help", "register"];
    const command = ctx.message.text.split(" ")[0].substring(1).split("@")[0];

    if (allowedCommands.includes(command)) {
      return next();
    }
  }

  const skipAuthUpdateTypes = [
    "my_chat_member",
    "chat_member",
    "chat_join_request",
  ];
  if (ctx.updateType && skipAuthUpdateTypes.includes(ctx.updateType)) {
    return next();
  }

  const telegramId = ctx.from?.id;

  if (!telegramId) {
    return ctx.reply(
      "Tidak dapat mengidentifikasi akun Anda. Silakan coba lagi.",
    );
  }

  try {
    const activeUsers = await userService.getAllActiveUsers();
    const isRegistered = activeUsers.some(
      (user) => user.telegramId === telegramId,
    );

    if (!isRegistered) {
      return ctx.reply(
        "Anda belum terdaftar. Silakan daftar terlebih dahulu.",
        Markup.inlineKeyboard([
          Markup.button.callback("Daftar Sekarang", "start_registration"),
        ]),
      );
    }

    return next();
  } catch (error) {
    console.error("Error checking user registration:", error);

    ctx.reply(
      "Terjadi kesalahan saat memeriksa status registrasi Anda. Silakan coba lagi nanti.",
    );
  }
};
