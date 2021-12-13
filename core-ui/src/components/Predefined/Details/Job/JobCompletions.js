import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export function JobCompletions({ job }) {
  const { t } = useTranslation();

  const succeeded = job.status.succeeded || 0;
  const completions = job.spec.completions || 0;
  const statusType = succeeded === completions ? 'success' : 'info';

  return (
    <StatusBadge
      type={statusType}
      tooltipContent={
        succeeded === completions
          ? t('jobs.tooltips.completed')
          : t('jobs.tooltips.not-completed')
      }
    >{`${succeeded} / ${completions}`}</StatusBadge>
  );
}
