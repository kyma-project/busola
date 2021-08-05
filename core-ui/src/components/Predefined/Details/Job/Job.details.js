import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReadableCreationTimestamp } from 'react-shared';

import { ResourcePods } from '../ResourcePods';
import { JobCompletions } from './JobCompletions';
import { JobConditions } from './JobConditions';

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
          '-'
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
          '-'
        ),
    },
  ];

  const customComponents = [JobConditions, ResourcePods];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={customComponents}
      {...otherParams}
    ></DefaultRenderer>
  );
}
