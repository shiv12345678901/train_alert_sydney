// In-memory store to keep memory usage low for free-tier hosting.
let previousStateByTrip = new Map();

export function getPreviousState(tripId) {
  return previousStateByTrip.get(tripId) || null;
}

export function setPreviousState(tripId, state) {
  previousStateByTrip.set(tripId, state);

  // Safety limit for memory growth: keep the latest 500 trips.
  if (previousStateByTrip.size > 500) {
    const oldestKey = previousStateByTrip.keys().next().value;
    previousStateByTrip.delete(oldestKey);
  }
}
