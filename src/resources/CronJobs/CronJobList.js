import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { CronJobLastScheduleTime } from 'shared/components/CronJob/CronJobLastScheduleTime';
import { CronJobSchedule } from 'shared/components/CronJob/CronJobSchedule';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { CronJobCreate } from './CronJobCreate';

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

  const description = (
    <Trans i18nKey="cron-jobs.description">
      <Link
        className="bsl-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceTitle={t('cron-jobs.title')}
      description={description}
      {...props}
      createResourceForm={CronJobCreate}
    />
  );
}

export default CronJobList;
