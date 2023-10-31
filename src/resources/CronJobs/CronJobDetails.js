import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { CronJobSchedule } from 'shared/components/CronJob/CronJobSchedule';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { CronJobLastScheduleTime } from 'shared/components/CronJob/CronJobLastScheduleTime';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';
import { useUrl } from 'hooks/useUrl';

import { CronJobConcurrencyPolicy } from './CronJobConcurrencyPolicy';
import { CronJobCreate } from './CronJobCreate';
import { CronJobJobs } from './CronJobJobs';

export function CronJobDetails(props) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();
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
          <Link className="bsl-link" to={namespaceUrl(`jobs/${jobName}`)}>
            {jobName}
          </Link>
        );
      },
    },
  ];

  const Events = () => (
    <EventsList
      namespace={props.namespace}
      filter={filterByResource('CronJob', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const CronJobPodTemplate = cronjob => (
    <PodTemplate template={cronjob.spec.jobTemplate.spec.template} />
  );

  return (
    <ResourceDetails
      customComponents={[CronJobJobs, Events, CronJobPodTemplate]}
      customColumns={customColumns}
      createResourceForm={CronJobCreate}
      {...props}
    />
  );
}

export default CronJobDetails;
