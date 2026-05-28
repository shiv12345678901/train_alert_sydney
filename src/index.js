import express from 'express';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { startScheduler, runTrainCheck } from './services/monitorService.js';

const app = express();

// Health endpoint for Hugging Face Spaces and UptimeRobot.
app.get('/', (_req, res) => {
  res.status(200).send('Bot running');
});

app.listen(env.port, () => {
  logger.info('Server started', { port: env.port });

  // Run immediately on startup so first alert cycle does not wait 60 seconds.
  runTrainCheck();
  startScheduler();
});
