import dotenv from 'dotenv';

dotenv.config();

const requiredKeys = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'TFNSW_API_KEY'];

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 7860),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  tfnswApiKey: process.env.TFNSW_API_KEY,
  trainRouteId: process.env.TRAIN_ROUTE_ID || 'T1',
  trainStopId: process.env.TRAIN_STOP_ID || '200060',
  timezone: process.env.TZ || 'Australia/Sydney'
};
