import React from 'react';
import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { Selector } from 'shared/components/Selector/Selector';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';

import { JobCreate } from './JobCreate';
import { JobCompletions } from './JobCompletions';
import { JobConditions } from './JobConditions';

export function JobDetails(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('jobs.completions'),
      value: job => <JobCompletions key="completions" job={job} />,
    },
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

  const Events = () => (
    <EventsList
      namespace={props.namespace}
      filter={filterByResource('Job', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const MatchSelector = job => (
    <Selector
      namespace={job?.metadata?.namespace}
      labels={job.spec?.selector?.matchLabels}
      expressions={job.spec?.selector?.matchExpressions}
      selector={job.spec?.selector}
    />
  );

  const JobPodTemplate = job => <PodTemplate template={job.spec?.template} />;

  const customComponents = [
    JobConditions,
    MatchSelector,
    Events,
    JobPodTemplate,
  ];

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={customComponents}
      createResourceForm={JobCreate}
      {...props}
    />
  );
}

export default JobDetails;
