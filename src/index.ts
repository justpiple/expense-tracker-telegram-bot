import { setupBot } from "./services/telegram";

async function startApp() {
  try {
    console.log("Starting Expense Tracker Bot...");
    await setupBot();
    console.log("Bot is ready and listening for messages!");
  } catch (error) {
    console.error("Failed to start the application:", error);
    process.exit(1);
  }
}

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

startApp();
