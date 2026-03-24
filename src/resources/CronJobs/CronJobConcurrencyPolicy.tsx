import { ReactNode } from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function CronJobConcurrencyPolicy({
  concurrencyPolicy,
}: {
  concurrencyPolicy: ReactNode;
}) {
  return (
    <StatusBadge type="Information" resourceKind="cron-jobs">
      {concurrencyPolicy}
    </StatusBadge>
  );
}
