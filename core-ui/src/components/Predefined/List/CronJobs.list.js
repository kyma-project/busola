import React from 'react';
import { useTranslation } from 'react-i18next';
import { CronJobLastScheduleTime } from 'shared/components/CronJob/CronJobLastScheduleTime';
import { CronJobSchedule } from 'shared/components/CronJob/CronJobSchedule';

export const CronJobsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('cron-jobs.schedule'),
      value: resource => <CronJobSchedule schedule={resource.spec.schedule} />,
    },
    {
      header: t('cron-jobs.last-schedule-time'),
      value: resource => (
        <CronJobLastScheduleTime
          lastScheduleTime={resource.status.lastScheduleTime}
        />
      ),
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      resourceName={t('cron-jobs.title')}
      description={t('cron-jobs.description')}
      {...otherParams}
    />
  );
};
