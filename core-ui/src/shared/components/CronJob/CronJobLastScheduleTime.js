import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';

export function CronJobLastScheduleTime({ lastScheduleTime }) {
  const { t } = useTranslation();
  if (!lastScheduleTime) {
    return t('cron-jobs.not-scheduled-yet');
  }
  return <ReadableCreationTimestamp timestamp={lastScheduleTime} />;
}
