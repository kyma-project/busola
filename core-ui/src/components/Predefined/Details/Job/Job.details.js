import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  ControlledBy,
  ReadableCreationTimestamp,
  EMPTY_TEXT_PLACEHOLDER,
} from 'react-shared';

import { JobCompletions } from './JobCompletions';
import { JobConditions } from './JobConditions';

import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { WorkloadSelector } from 'shared/components/WorkloadSelector/WorkloadSelector';

export function JobsDetails({ DefaultRenderer, ...otherParams }) {
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
      namespace={otherParams.namespace}
      filter={filterByResource('Job', otherParams.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const SelectorLabels = job => {
    const { t } = useTranslation();
    return (
      <WorkloadSelector
        resource={job}
        labels={job.spec.selector?.matchLabels}
        title={t('selector.title')}
      />
    );
  };

  const customComponents = [JobConditions, Events, SelectorLabels];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={customComponents}
      {...otherParams}
    ></DefaultRenderer>
  );
}
