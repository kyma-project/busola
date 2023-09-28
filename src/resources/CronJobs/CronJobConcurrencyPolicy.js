import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function CronJobConcurrencyPolicy({ concurrencyPolicy }) {
  return (
    <StatusBadge
      type="Information"
      tooltipProps={{ position: 'bottom' }}
      resourceKind="cron-jobs"
    >
      {concurrencyPolicy}
    </StatusBadge>
  );
}
