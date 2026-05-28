import cron from 'node-cron';
import { fetchRouteTrains } from './tfnswService.js';
import { sendTelegramAlert } from './telegramService.js';
import { logger } from '../utils/logger.js';
import { getPreviousState, setPreviousState } from '../utils/trainStateStore.js';
import { buildStateKey, detectChanges } from '../utils/trainComparator.js';

function formatAlert(train, changes) {
  return [
    '🚆 Sydney Train Alert',
    `Line: ${train.line}`,
    `Destination: ${train.destination}`,
    `Status: ${train.status}`,
    `Platform: ${train.platform || 'N/A'}`,
    `Scheduled: ${train.scheduledTime || 'N/A'}`,
    `Estimated: ${train.estimatedTime || 'N/A'}`,
    `Changes: ${changes.join('; ')}`
  ].join('\n');
}

export async function runTrainCheck() {
  try {
    const trains = await fetchRouteTrains();

    if (!trains.length) {
      logger.warn('No trains found for configured route');
      return;
    }

    for (const train of trains) {
      const previous = getPreviousState(train.tripId);
      const changes = detectChanges(previous, train);

      if (previous && changes.length > 0) {
        await sendTelegramAlert(formatAlert(train, changes));
      }

      const previousKey = previous ? buildStateKey(previous) : null;
      const currentKey = buildStateKey(train);

      // Prevent duplicate alerts by updating store every cycle and alerting only on key change.
      if (previousKey !== currentKey) {
        setPreviousState(train.tripId, train);
        logger.info('Train state updated', { tripId: train.tripId, status: train.status });
      }
    }
  } catch (error) {
    logger.error('Train monitoring failed', { error: error.message, stack: error.stack });
  }
}

export function startScheduler() {
  // Every 60 seconds (1 minute) as required.
  cron.schedule('* * * * *', () => {
    runTrainCheck();
  });

  logger.info('Scheduler started with 60-second interval');
}
