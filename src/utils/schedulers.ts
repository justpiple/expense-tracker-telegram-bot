import cron from "node-cron";
import { userService } from "../services/user";
import { userController } from "../controllers/userController";
import { Telegraf } from "telegraf";
import { REMINDER_SCHEDULE, TIME_ZONE } from "../config/env";

/**
 * Setup daily reminder scheduler
 * Runs every day at 21:00
 */
export function setupReminderScheduler(bot: Telegraf) {
  if (!REMINDER_SCHEDULE) return;

  const [hour, minute] = REMINDER_SCHEDULE.split(":");
  cron.schedule(
    `${minute} ${hour} * * *`,
    async () => {
      console.log("Running daily expense reminder scheduler...");

      try {
        const activeUsers = await userService.getAllActiveUsers();

        if (activeUsers.length === 0) {
          console.log("No active users found for sending reminders");
          return;
        }

        console.log(`Sending reminders to ${activeUsers.length} users`);

        for (const user of activeUsers) {
          await userController.sendDailyReminder(bot, user.telegramId);
        }

        console.log("Daily expense reminders sent successfully");
      } catch (error) {
        console.error("Error sending daily reminders:", error);
      }
    },
    {
      timezone: TIME_ZONE,
    },
  );

  console.log("Daily expense reminder scheduler setup completed");
}
