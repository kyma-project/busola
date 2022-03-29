import React from 'react';
import { useTranslation } from 'react-i18next';
import { CronJobLastScheduleTime } from 'shared/components/CronJob/CronJobLastScheduleTime';
import { CronJobSchedule } from 'shared/components/CronJob/CronJobSchedule';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { Trans } from 'react-i18next';
import { CronJobsCreate } from 'components/Predefined/Create/Jobs/CronJobs.create';

const CronJobsList = props => {
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

  const description = (
    <Trans i18nKey="cron-jobs.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceName={t('cron-jobs.title')}
      description={description}
      createResourceForm={CronJobsCreate}
      {...props}
    />
  );
};

export default CronJobsList;
