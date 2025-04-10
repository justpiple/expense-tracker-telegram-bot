# Expense Tracker Telegram Bot

A Telegram bot that helps you track expenses and automatically saves them to Notion. This bot uses the Gemini AI to intelligently extract expense information from natural language messages and photos with receipts.

## Features

- 📷 Upload and process receipts with captions
- 🤖 AI-powered expense extraction from natural language messages
- 📊 Automatic categorization of expenses and save to Notion

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- A Telegram Bot Token (from BotFather)
- A Notion account with the Ultimate Budget & Expense Tracker template
- A Google Gemini API key

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/expense-tracker-bot.git
cd expense-tracker-bot
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up Notion

#### Get the Notion Template

1. Visit [Ultimate Budget and Expense Tracker](https://www.notion.com/templates/ultimate-budget-and-expense-tracker)
2. Click "Get template"
3. The template will be added to your Notion workspace

#### Create a Notion Integration

1. Go to [Notion Integrations](https://www.notion.com/my-integrations)
2. Click "Create new integration"
3. Name your integration (e.g., "Expense Tracker Bot")
4. Select the capabilities required (at minimum: Read content, Update content, Insert content)
5. Click "Submit" to create your integration
6. Copy the "Internal Integration Token" - this is your `NOTION_API_KEY`

#### Share the Database with Your Integration

1. Open your Notion Budget & Expense Tracker template
2. For each database (Expenses, Month, Year, Subcategories, Accounts, Recurring Payments), do the following:
   - Click on the three dots (•••) in the top right of the database
   - Select "Add connections"
   - Search for your integration name and select it
   - Click "Confirm"

#### Get Database IDs

For each database in your Notion workspace, you need to get its ID:

1. Open the database in your browser
2. Look at the URL, which will be in this format: `https://www.notion.so/workspace/[database-id]?v=[view-id]`
3. Copy the `[database-id]` part (it's a 32-character string)
4. Add these IDs to your `.env` file for each database:
   - Main expenses database
   - Month database
   - Year database
   - Subcategories database
   - Accounts database
   - Recurring payments database

### 4. Set up Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send the command `/newbot` and follow the instructions
3. Once your bot is created, BotFather will give you a token
4. Copy this token as your `TELEGRAM_BOT_TOKEN`

### 5. Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy this key as your `GEMINI_API_KEY`

### 6. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and fill in your API keys and database IDs

## Running the Bot

### Development

```bash
bun dev
```

### Production

```bash
bun run build
bun start
```

## Usage

### Bot Commands

- `/start` - Welcome message and introduction
- `/help` - Detailed usage instructions
- `/categories` - List all available expense categories
- `/accounts` - List all available payment accounts

### Recording Expenses

Send a message in one of these formats:

- Simple expense: "Lunch 75k via BCA"
- With category: "Bought coffee 25k category Food using GoPay"
- With date: "Electricity bill 250k on April 3 via Mandiri"
- Multiple expenses: "Breakfast 30k via BCA. Gas 100k via Cash."
- With receipt: Send a photo with a caption describing the expense

### Creating New Categories

Include "new:" or "baru:" in your message:

```
Bought books 150k category new: Education via BCA
```

## Project Structure

```
/expense-tracker-bot/
├── src/
│   ├── config/       # Environment and constants
│   ├── controllers/  # Request handlers
│   ├── repositories/ # Database operations
│   ├── services/     # External services (Notion, Telegram, AI)
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Helper functions
│   └── index.ts      # Main entry point
├── .env              # Environment variables (private)
└── package.json      # Project dependencies
```

## Future Enhancements

- Income tracking

## License

[MIT](LICENSE)
