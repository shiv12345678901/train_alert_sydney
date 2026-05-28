export function buildStateKey(train) {
  return JSON.stringify({
    scheduled: train.scheduledTime,
    estimated: train.estimatedTime,
    platform: train.platform,
    status: train.status
  });
}

export function detectChanges(previousTrain, currentTrain) {
  const changes = [];

  if (!previousTrain) {
    changes.push('Initial state captured');
    return changes;
  }

  if (currentTrain.status !== previousTrain.status) {
    changes.push(`Status changed: ${previousTrain.status} -> ${currentTrain.status}`);
  }

  if (currentTrain.platform !== previousTrain.platform) {
    changes.push(`Platform changed: ${previousTrain.platform || 'N/A'} -> ${currentTrain.platform || 'N/A'}`);
  }

  if (currentTrain.estimatedTime && previousTrain.estimatedTime && currentTrain.estimatedTime !== previousTrain.estimatedTime) {
    changes.push(`Estimated time changed: ${previousTrain.estimatedTime} -> ${currentTrain.estimatedTime}`);
  }

  return changes;
}
