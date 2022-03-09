import React from 'react';
import { useTranslation } from 'react-i18next';
import { CronJobLastScheduleTime } from 'shared/components/CronJob/CronJobLastScheduleTime';
import { CronJobSchedule } from 'shared/components/CronJob/CronJobSchedule';
import { Link, ResourcesList } from 'react-shared';
import { Trans } from 'react-i18next';
import { usePrepareListProps } from 'routing/common';
import { CronJobsCreate } from 'components/Predefined/Create/Jobs/CronJobs.create';

const CronJobsList = () => {
  const params = usePrepareListProps('CronJobs');
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
      {...params}
    />
  );
};

export default CronJobsList;
