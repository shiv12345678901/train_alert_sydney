import axios from 'axios';
import { env } from '../config/env.js';

const tfnswClient = axios.create({
  baseURL: 'https://api.transport.nsw.gov.au/v1/tp',
  timeout: 10000,
  headers: {
    Authorization: `apikey ${env.tfnswApiKey}`,
    Accept: 'application/json'
  }
});

async function requestWithRetry(requestFn, retries = 3, delayMs = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}

function mapJourneyToTrain(journey) {
  const leg = journey.legs?.[0] || {};
  const dep = leg.origin || {};
  const tripId = leg?.tripId || `${leg.transportation?.number || 'unknown'}-${dep.disassembledName || 'stop'}`;

  const scheduledTime = dep.departureTimePlanned || null;
  const estimatedTime = dep.departureTimeEstimated || null;
  const platform = dep.platform?.name || dep.platform?.number || null;

  let status = 'on_time';
  if (leg.cancelled) status = 'cancelled';
  else if (scheduledTime && estimatedTime && scheduledTime !== estimatedTime) status = 'delayed';

  return {
    tripId,
    line: leg.transportation?.name || 'Unknown line',
    destination: leg.direction || 'Unknown destination',
    scheduledTime,
    estimatedTime,
    platform,
    status
  };
}

export async function fetchRouteTrains() {
  const response = await requestWithRetry(() =>
    tfnswClient.get('/trip', {
      params: {
        outputFormat: 'rapidJSON',
        coordOutputFormat: 'EPSG:4326',
        depArrMacro: 'dep',
        type_origin: 'stop',
        name_origin: env.trainStopId,
        type_destination: 'any',
        name_destination: '0',
        calcNumberOfTrips: 8,
        TfNSWTR: true,
        itdDateTimeDepArr: 'dep'
      }
    })
  );

  const journeys = response.data?.journeys || [];

  return journeys
    .map(mapJourneyToTrain)
    .filter((train) => train.line.toUpperCase().includes(env.trainRouteId.toUpperCase()));
}
