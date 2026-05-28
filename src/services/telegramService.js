import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const telegramApi = axios.create({
  baseURL: `https://api.telegram.org/bot${env.telegramBotToken}`,
  timeout: 10000
});

export async function sendTelegramAlert(message) {
  try {
    await telegramApi.post('/sendMessage', {
      chat_id: env.telegramChatId,
      text: message,
      disable_web_page_preview: true
    });

    logger.info('Telegram alert sent');
  } catch (error) {
    logger.error('Failed to send Telegram alert', {
      error: error.message,
      response: error.response?.data
    });
  }
}
