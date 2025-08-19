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
import { ResourceDescription } from 'resources/Jobs';

export function JobDetails(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: job => (
        <ControlledBy
          ownerReferences={job.metadata.ownerReferences}
          namespace={job.metadata.namespace}
        />
      ),
    },
  ];

  const customStatusColumns = [
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

  const statusConditions = job => {
    return job?.status?.conditions?.map(condition => {
      return {
        header: { titleText: condition.type, status: condition.status },
        message:
          condition.message ?? condition.reason ?? EMPTY_TEXT_PLACEHOLDER,
        customContent: [
          {
            header: t('jobs.conditions.last-probe'),
            value: condition.lastProbeTime ? (
              <ReadableCreationTimestamp timestamp={condition.lastProbeTime} />
            ) : (
              EMPTY_TEXT_PLACEHOLDER
            ),
          },
          {
            header: t('jobs.conditions.last-transition'),
            value: condition.lastTransitionTime ? (
              <ReadableCreationTimestamp
                timestamp={condition.lastTransitionTime}
              />
            ) : (
              EMPTY_TEXT_PLACEHOLDER
            ),
          },
        ],
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
      {...props}
    />
  );
}

export default JobDetails;
