import React from 'react';
import { CronJobSchedule } from 'shared/components/CronJob/CronJobSchedule';
import { CronJobConcurrencyPolicy } from './CronJobConcurrencyPolicy';
import { CronJobJobs } from './CronJobJobs.js';
import { CronJobLastScheduleTime } from '../../../../shared/components/CronJob/CronJobLastScheduleTime';
import { useTranslation } from 'react-i18next';
import { navigateToFixedPathResourceDetails } from 'react-shared';
import { Link } from 'fundamental-react';
import { ResourceDetails } from 'react-shared';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { usePrepareDetailsProps } from 'routing/common';
import { CronJobsCreate } from 'components/Predefined/Create/Jobs/CronJobs.create';

const CronJobsDetails = () => {
  const params = usePrepareDetailsProps('CronJobs');
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
    {
      header: t('cron-jobs.concurrency-policy.title'),
      value: resource => (
        <CronJobConcurrencyPolicy
          concurrencyPolicy={resource.spec.concurrencyPolicy}
        />
      ),
    },
    {
      header: t('cron-jobs.last-job-execution'),
      value: resource => {
        if (!resource.status.active) {
          return t('cron-jobs.not-scheduled-yet');
        }

        const jobName =
          resource.status.active[resource.status.active.length - 1].name;
        return (
          <Link
            onClick={() => navigateToFixedPathResourceDetails('jobs', jobName)}
          >
            {jobName}
          </Link>
        );
      },
    },
  ];

  const Events = () => (
    <EventsList
      namespace={params.namespace}
      filter={filterByResource('CronJob', params.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  return (
    <ResourceDetails
      customComponents={[CronJobJobs, Events]}
      customColumns={customColumns}
      createResourceForm={CronJobsCreate}
      {...params}
    />
  );
};

export default CronJobsDetails;
