import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { Selector } from 'shared/components/Selector/Selector';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';

import JobCreate from './JobCreate';
import { JobCompletions } from './JobCompletions';
import { JobConditions } from './JobConditions';
import { ResourceDescription } from 'resources/Jobs';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';

export function JobDetails(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('jobs.start-time'),
      value: job =>
        job.status.startTime ? (
          <ReadableCreationTimestamp
            key="start"
            timestamp={job.status.startTime}
          />
        ) : (
          EMPTY_TEXT_PLACEHOLDER
        ),
    },
    {
      header: t('jobs.completion-time'),
      value: job =>
        job.status.completionTime ? (
          <ReadableCreationTimestamp
            key="completion"
            timestamp={job.status.completionTime}
          />
        ) : (
          EMPTY_TEXT_PLACEHOLDER
        ),
    },
    {
      header: t('common.headers.owner'),
      value: job => (
        <ControlledBy ownerReferences={job.metadata.ownerReferences} />
      ),
    },
  ];

  const customStatusColumns2 = [
    {
      header: t('jobs.active'),
      value: job => <div>{job?.status?.active ?? EMPTY_TEXT_PLACEHOLDER}</div>,
    },
    {
      header: t('jobs.failed'),
      value: job => <div>{job?.status?.failed ?? EMPTY_TEXT_PLACEHOLDER}</div>,
    },
    {
      header: t('jobs.ready'),
      value: job => <div>{job?.status?.ready ?? EMPTY_TEXT_PLACEHOLDER}</div>,
    },
    {
      header: t('jobs.succeeded'),
      value: job => (
        <div>{job?.status?.succeeded ?? EMPTY_TEXT_PLACEHOLDER}</div>
      ),
    },
  ];

  const customStatusColumns = [
    {
      header: '',
      value: job => <div></div>,
    },
  ];

  const statusConditions = job => {
    return job?.status?.conditions?.map(condition => {
      return {
        header: { titleText: condition.type, status: condition.status },
        message:
          condition.message ?? condition.reason ?? EMPTY_TEXT_PLACEHOLDER,
      };
    });
  };

  const Events = () => (
    <EventsList
      key="events"
      namespace={props.namespace}
      filter={filterByResource('Job', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const MatchSelector = job => (
    <Selector
      key="match-selector"
      namespace={job?.metadata?.namespace}
      labels={job.spec?.selector?.matchLabels}
      expressions={job.spec?.selector?.matchExpressions}
      selector={job.spec?.selector}
    />
  );

  const JobPodTemplate = job => (
    <PodTemplate key="pod-template" template={job.spec?.template} />
  );

  const customOverview = job => {
    return [
      <CountingCard
        title="Pods Overview"
        subTitle="Pods "
        value={
          (job?.status?.failed ?? 0) +
          (job?.status?.succeeded ?? 0) +
          (job?.status?.ready ?? 0) +
          (job?.status?.active ?? 0)
        }
        extraInfo={[
          {
            title: 'Active',
            value: job?.status?.active ?? 0,
          },
          {
            title: 'Failed',
            value: job?.status?.failed ?? 0,
          },
          {
            title: 'Ready',
            value: job?.status?.ready ?? 0,
          },
          {
            title: 'Succeeded',
            value: job?.status?.succeeded ?? 0,
          },
        ]}
      />,
      <CountingCard
        title="Uncounted Terminated Pods Overview"
        subTitle="Uncounted Terminated Pods "
        value={
          (job?.status?.uncountedTerminatedPods?.failed?.length ?? 0) +
          (job?.status?.uncountedTerminatedPods?.succeeded?.length ?? 0)
        }
        extraInfo={[
          {
            title: 'Failed',
            value: job?.status?.uncountedTerminatedPods?.failed?.length ?? 0,
          },
          {
            title: 'Succeeded',
            value: job?.status?.uncountedTerminatedPods?.succeeded?.length ?? 0,
          },
        ]}
      />,
    ];
  };

  const customComponents = [MatchSelector, JobPodTemplate, Events];

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={customComponents}
      createResourceForm={JobCreate}
      description={ResourceDescription}
      customStatusColumns={customStatusColumns}
      statusConditions={statusConditions}
      statusBadge={job => <JobCompletions key="completions" job={job} />}
      customOverview={customOverview}
      {...props}
    />
  );
}

export default JobDetails;
