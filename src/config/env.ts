import * as dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = [
  "TELEGRAM_BOT_TOKEN",
  "NOTION_API_KEY",
  "GEMINI_API_KEY",
  "NOTION_DB_EXPENSES",
  "NOTION_DB_MONTH",
  "NOTION_DB_YEAR",
  "NOTION_DB_SUBCATEGORIES",
  "NOTION_DB_ACCOUNTS",
  "NOTION_DB_RECURRING_PAYMENTS",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
}

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
export const NOTION_API_KEY = process.env.NOTION_API_KEY!;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export const NOTION_DB = {
  EXPENSES: process.env.NOTION_DB_EXPENSES!,
  MONTH: process.env.NOTION_DB_MONTH!,
  YEAR: process.env.NOTION_DB_YEAR!,
  SUBCATEGORIES: process.env.NOTION_DB_SUBCATEGORIES!,
  ACCOUNTS: process.env.NOTION_DB_ACCOUNTS!,
  RECURRING_PAYMENTS: process.env.NOTION_DB_RECURRING_PAYMENTS!,
};
