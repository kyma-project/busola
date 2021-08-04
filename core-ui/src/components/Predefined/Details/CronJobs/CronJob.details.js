import React from 'react';
import { CronJobSchedule } from 'shared/components/CronJob/CronJobSchedule';
import { CronJobConcurrencyPolicy } from './CronJobConcurrencyPolicy';
import { CronJobJobs } from './CronJobJobs.js';
import { CronJobLastScheduleTime } from '../../../../shared/components/CronJob/CronJobLastScheduleTime';

export const CronJobsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const customColumns = [
    {
      header: 'Schedule',
      value: resource => <CronJobSchedule schedule={resource.spec.schedule} />,
    },
    {
      header: 'Last schedule time',
      value: resource => (
        <CronJobLastScheduleTime
          lastScheduleTime={resource.status.lastScheduleTime}
        />
      ),
    },
    {
      header: 'Concurrency Policy',
      value: resource => (
        <CronJobConcurrencyPolicy
          concurrencyPolicy={resource.spec.concurrencyPolicy}
        />
      ),
    },
    {
      header: 'Last job execution',
      value: resource =>
        resource.status.active
          ? resource.status.active[resource.status.active.length - 1].name
          : 'None scheduled yet',
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[CronJobJobs]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
