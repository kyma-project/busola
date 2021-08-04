import React from 'react';
import { StatusBadge } from 'react-shared';

export function CronJobConcurrencyPolicy({ concurrencyPolicy }) {
  const descriptions = {
    Allow: 'Allow concurrent executions.',
    Forbid:
      "No concurrent executions, skip new run if the previous one hasn't finished yet.",
    Replace: 'No concurrent executions, replace previous run with the new one.',
  };

  return (
    <StatusBadge
      type="info"
      tooltipProps={{ position: 'bottom' }}
      tooltipContent={descriptions[concurrencyPolicy]}
    >
      {concurrencyPolicy}
    </StatusBadge>
  );
}
