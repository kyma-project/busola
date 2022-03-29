import React from 'react';
import { useTranslation } from 'react-i18next';
import { TooltipBadge } from 'shared/components/TooltipBadge/TooltipBadge';

export function JobCompletions({ job }) {
  const { t } = useTranslation();

  const succeeded = job.status.succeeded || 0;
  const completions = job.spec.completions || 0;
  const statusType = succeeded === completions ? 'positive' : 'informative';

  return (
    <TooltipBadge
      type={statusType}
      tooltipContent={
        succeeded === completions
          ? t('jobs.tooltips.complete')
          : t('jobs.tooltips.not-complete')
      }
    >{`${succeeded} / ${completions}`}</TooltipBadge>
  );
}
