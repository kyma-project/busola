import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function CronJobConcurrencyPolicy({ concurrencyPolicy }) {
  return (
    <StatusBadge
      type="info"
      tooltipProps={{ position: 'bottom' }}
      resourceKind="cron-jobs"
    >
      {concurrencyPolicy}
    </StatusBadge>
  );
}
