import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function CronJobConcurrencyPolicy({ concurrencyPolicy }) {
  const { i18n } = useTranslation();
  return (
    <StatusBadge
      type="info"
      tooltipProps={{ position: 'bottom' }}
      resourceKind="cron-jobs"
      i18n={i18n}
    >
      {concurrencyPolicy}
    </StatusBadge>
  );
}
