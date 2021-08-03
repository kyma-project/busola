import React from 'react';
import { CronJobLastScheduleTime } from 'shared/components/CronJob/CronJobLastScheduleTime';
import { CronJobSchedule } from '../../../shared/components/CronJob/CronJobSchedule';

export const CronJobsList = ({ DefaultRenderer, ...otherParams }) => {
  const customColumns = [
    {
      header: 'Schedule',
      value: resource => <CronJobSchedule schedule={resource.spec.schedule} />,
    },
    {
      header: 'Last schedue time',
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
      resourceName="Cron Jobs"
      {...otherParams}
    />
  );
};
