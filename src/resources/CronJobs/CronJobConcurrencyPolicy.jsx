import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function CronJobConcurrencyPolicy({ concurrencyPolicy }) {
  return (
    <StatusBadge type="Information" resourceKind="cron-jobs">
      {concurrencyPolicy}
    </StatusBadge>
  );
}
