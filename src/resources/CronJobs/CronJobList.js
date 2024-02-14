import React from 'react';
import { useTranslation } from 'react-i18next';

import { CronJobLastScheduleTime } from 'shared/components/CronJob/CronJobLastScheduleTime';
import { CronJobSchedule } from 'shared/components/CronJob/CronJobSchedule';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { CronJobCreate } from './CronJobCreate';
import { description } from './CronJob';

export function CronJobList(props) {
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
    <ResourcesList
      customColumns={customColumns}
      resourceTitle={t('cron-jobs.title')}
      description={description}
      {...props}
      createResourceForm={CronJobCreate}
      emptyListProps={{
        subtitleText: t('cron-jobs.description'),
        url:
          'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/',
      }}
    />
  );
}

export default CronJobList;
