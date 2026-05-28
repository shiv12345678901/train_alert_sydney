# Sydney Train Alert Backend (TfNSW + Telegram)

A lightweight, production-ready Node.js backend that checks Transport for NSW realtime data every 60 seconds and sends Telegram alerts **only when train status changes**.

## Features

- Express server with health check (`GET /` => `Bot running`)
- TfNSW realtime polling with retry on failures
- Route monitoring for a selected line (e.g., `T1`)
- Detects delays, cancellations, and platform changes
- In-memory previous state store (no database needed)
- Duplicate alert prevention
- Telegram Bot API notifications
- Designed for free hosting (low memory, small dependency set)
- Ready for Hugging Face Spaces + UptimeRobot

## Project Structure

```bash
.
├── src/
│   ├── index.js
│   ├── config/
│   │   └── env.js
│   ├── services/
│   │   ├── monitorService.js
│   │   ├── telegramService.js
│   │   └── tfnswService.js
│   └── utils/
│       ├── logger.js
│       ├── trainComparator.js
│       └── trainStateStore.js
├── .env.example
├── package.json
└── README.md
```

## 1) Prerequisites

- Node.js 18+
- TfNSW API key
- Telegram bot token + chat ID

## 2) Setup

```bash
git clone <your-repo-url>
cd train_alert_sydney
npm install
cp .env.example .env
```

Update `.env` values:

```env
PORT=7860
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
TFNSW_API_KEY=...
TRAIN_ROUTE_ID=T1
TRAIN_STOP_ID=200060
TZ=Australia/Sydney
```

Run locally:

```bash
npm run start
```

Health check:

```bash
curl http://localhost:7860/
# Bot running
```

## 3) Create Telegram Bot (BotFather)

1. Open Telegram and search for **@BotFather**.
2. Send `/newbot` and follow prompts.
3. Copy the bot token into `TELEGRAM_BOT_TOKEN`.
4. Start a chat with your bot and send any message.
5. Get your chat ID:
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find `chat.id` in response JSON.
6. Put this value in `TELEGRAM_CHAT_ID`.

## 4) TfNSW API Key

1. Create developer account at Transport for NSW Open Data portal.
2. Subscribe to realtime APIs.
3. Copy key to `TFNSW_API_KEY`.

## 5) Deploy to Hugging Face Spaces

1. Create a new **Space** on Hugging Face.
2. Choose **Docker** or **Node.js-compatible setup**.
3. Push this repository to the Space.
4. Add these Space Secrets:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `TFNSW_API_KEY`
   - Optional: `TRAIN_ROUTE_ID`, `TRAIN_STOP_ID`, `PORT`
5. Ensure the app starts with:
   - `npm install`
   - `npm run start`
6. Set Space port to `7860` (or set `PORT` env var).

## 6) UptimeRobot Setup

1. Create an UptimeRobot account.
2. Add a new monitor:
   - Type: `HTTP(s)`
   - URL: `https://<your-space-url>/`
   - Interval: 5 minutes
3. Expected response body includes: `Bot running`.
4. Optional: set alert contacts for downtime notifications.

## Operational Notes

- The scheduler runs every minute using `node-cron`.
- First check runs immediately on startup.
- Alerts trigger only when train state changes.
- State is kept in memory to keep hosting cost at zero.
- If host restarts, state resets (normal for stateless free hosting).

## Future Expansion Ideas

- Add multiple routes and multiple chats
- Persist state in Redis for restart resilience
- Add REST endpoint to manage subscriptions
- Add unit tests with mocked TfNSW + Telegram clients
