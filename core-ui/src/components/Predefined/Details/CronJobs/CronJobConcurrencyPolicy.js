import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export function CronJobConcurrencyPolicy({ concurrencyPolicy }) {
  const { t } = useTranslation();
  const descriptions = {
    Allow: t('cron-jobs.concurrency-policy.descriptions.allow'),
    Forbid: t('cron-jobs.concurrency-policy.descriptions.forbid'),
    Replace: t('cron-jobs.concurrency-policy.descriptions.replace'),
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
