import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { CronJobSchedule } from 'shared/components/CronJob/CronJobSchedule';
import {
  ResourceDetails,
  ResourceDetailsProps,
} from 'shared/components/ResourceDetails/ResourceDetails';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { CronJobLastScheduleTime } from 'shared/components/CronJob/CronJobLastScheduleTime';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';
import { useUrl } from 'hooks/useUrl';

import { CronJobConcurrencyPolicy } from './CronJobConcurrencyPolicy';
import CronJobCreate from './CronJobCreate';
import { CronJobJobs } from './CronJobJobs';
import { ResourceDescription } from 'resources/CronJobs';
import { Link } from 'shared/components/Link/Link';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

type CronJobDetailsProps = Omit<
  ResourceDetailsProps,
  | 'customComponents'
  | 'createResourceForm'
  | 'description'
  | 'customStatusColumns'
>;

export function CronJobDetails({
  namespace,
  resourceName,
  ...props
}: CronJobDetailsProps) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  const customStatusColumns = [
    {
      header: t('cron-jobs.last-schedule-time'),
      value: (resource: { status: Record<string, any> }) => (
        <CronJobLastScheduleTime
          lastScheduleTime={resource.status.lastScheduleTime}
        />
      ),
    },
    {
      header: t('cron-jobs.last-successful-time'),
      value: (resource: { status: Record<string, any> }) => (
        <ReadableCreationTimestamp
          timestamp={
            resource.status.lastSuccessfulTime ?? EMPTY_TEXT_PLACEHOLDER
          }
        ></ReadableCreationTimestamp>
      ),
    },
    {
      header: t('cron-jobs.last-job-execution'),
      value: (resource: { status: Record<string, any> }) => {
        if (!resource.status.active) {
          return t('cron-jobs.not-scheduled-yet');
        }

        const jobName =
          resource.status.active[resource.status.active.length - 1].name;
        return <Link url={namespaceUrl(`jobs/${jobName}`)}>{jobName}</Link>;
      },
    },
    {
      header: t('cron-jobs.active'),
      value: (resource: { status: Record<string, any> }) =>
        resource.status.active?.length ? (
          <ReadableCreationTimestamp
            timestamp={resource.status.active?.length}
          />
        ) : (
          EMPTY_TEXT_PLACEHOLDER
        ),
    },
  ];

  const Specification = ({
    spec,
  }: {
    spec: { schedule: string; concurrencyPolicy: ReactNode };
  }) => (
    <UI5Panel
      key="specification"
      title={t('common.headers.specification')}
      accessibleName={t('common.accessible-name.specification')}
      keyComponent="specification-panel"
    >
      <LayoutPanelRow
        name={t('cron-jobs.schedule')}
        value={<CronJobSchedule schedule={spec.schedule} />}
      />
      <LayoutPanelRow
        name={t('cron-jobs.concurrency-policy.title')}
        value={
          <CronJobConcurrencyPolicy
            concurrencyPolicy={spec.concurrencyPolicy}
          />
        }
      />
    </UI5Panel>
  );

  const Events = () => (
    <EventsList
      key="events"
      namespace={namespace}
      filter={filterByResource('CronJob', resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const CronJobPodTemplate = (cronjob: {
    spec: { jobTemplate: { spec: { template: Record<string, any> } } };
  }) => (
    <PodTemplate
      key="pod-template"
      template={cronjob.spec.jobTemplate.spec.template}
    />
  );

  return (
    <ResourceDetails
      customComponents={[
        Specification,
        CronJobJobs,
        CronJobPodTemplate,
        Events,
      ]}
      createResourceForm={CronJobCreate}
      description={ResourceDescription}
      customStatusColumns={customStatusColumns}
      {...props}
    />
  );
}

export default CronJobDetails;
