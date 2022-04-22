function hasTrueType(conditionType, conditions) {
  let cond = false;
  conditions.forEach(condition => {
    if (condition.type === conditionType && condition.status === 'True') {
      cond = true;
    }
  });
  return cond;
}

function hasUnknownTypeWithReason(conditionType, conditions, reason) {
  let cond = false;
  conditions.forEach(condition => {
    if (
      condition.type === conditionType &&
      condition.status === 'Unknown' &&
      condition.reason === reason
    ) {
      cond = true;
    }
  });
  return cond;
}

function getReason({ conditionType }) {
  switch (conditionType) {
    case 'ConfigurationReady':
      return 'CONFIG';
    case 'BuildReady':
      return 'JOB';
    case 'Running':
      return 'SERVICE';
    default:
      return 'CONFIG';
  }
}
function getFailedCondition(conditions) {
  let condition = {};
  let hasFailed = false;
  conditions.forEach(cond => {
    if (cond.status === 'False') {
      hasFailed = true;
      condition = cond;
    }
  });
  return { hasFailed, condition };
}

export function getFunctionStatus(status) {
  if (!status || !status?.conditions.length) {
    return { phase: 'INITIALIZING', reason: null, message: null };
  }
  const functionIsRunning = hasTrueType('Running', status.conditions);
  const functionIsUnhealthy = hasUnknownTypeWithReason(
    'Running',
    status.conditions,
    'MinReplicasNotAvailable',
  );
  const functionConfigCreated = hasTrueType(
    'ConfigurationReady',
    status.conditions,
  );
  const functionJobFinished = hasTrueType('BuildReady', status.conditions);

  const { hasFailed, condition } = getFailedCondition(status.conditions);

  if (hasFailed) {
    if (functionIsRunning) {
      return {
        phase: 'NEW_REVISION_ERROR',
        reason: getReason(condition.type),
        message: condition.message,
      };
    } else {
      return {
        phase: 'FAILED',
        reason: getReason(condition.type),
        message: condition.message,
      };
    }
  }

  let phase;
  if (functionConfigCreated) {
    if (functionJobFinished) {
      if (functionIsRunning) {
        phase = 'RUNNING';
      } else if (functionIsUnhealthy) {
        phase = 'UNHEALTHY';
      } else {
        phase = 'DEPLOYING';
      }
    } else {
      phase = 'BUILDING';
    }
  } else {
    phase = 'INITIALIZING';
  }

  return { phase: phase, reason: null, message: null };
}
