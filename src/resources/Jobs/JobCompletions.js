import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function JobCompletions({ job }) {
  const { t } = useTranslation();

  const succeeded = job.status.succeeded || 0;
  const completions = job.spec.completions || 0;
  const statusType = succeeded === completions ? 'Success' : 'Information';

  return (
    <StatusBadge
      type={statusType}
      tooltipContent={
        succeeded === completions
          ? t('jobs.tooltips.complete')
          : t('jobs.tooltips.not-complete')
      }
    >{`${succeeded} / ${completions}`}</StatusBadge>
  );
}
