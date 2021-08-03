import React from 'react';
import { StatusBadge } from 'react-shared';

export function CronJobConcurrencyPolicy({ concurrencyPolicy }) {
  const descriptions = {
    Allow: 'Allow concurrent executions.',
    Forbid:
      "No concurrent executions, skip current run if the previous one hasn't finished yet.",
    Replace:
      "No concurrent executions, replace current run if the previous one ńhasn't finished yet.",
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
