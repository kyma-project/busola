import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  ReadableCreationTimestamp,
  EMPTY_TEXT_PLACEHOLDER,
} from 'react-shared';

import { ResourcePods } from '../ResourcePods';
import { JobCompletions } from './JobCompletions';
import { JobConditions } from './JobConditions';

export function JobsDetails({ DefaultRenderer, i18n, ...otherParams }) {
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
  ];

  const customComponents = [
    resource => JobConditions({ job: resource, i18n }),
    ResourcePods,
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={customComponents}
      {...otherParams}
    ></DefaultRenderer>
  );
}
