import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';

import { JobCompletions } from './JobCompletions';
import { JobCreate } from './JobCreate';
import { Description } from 'shared/components/Description/Description';
import { jobDocsURL, jobI18nDescriptionKey } from 'resources/Jobs/index';

export const JobList = props => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('jobs.completions'),
      value: job => <JobCompletions job={job} />,
    },
    {
      header: t('common.headers.owner'),
      value: job => (
        <ControlledBy ownerReferences={job.metadata.ownerReferences} />
      ),
    },
  ];

  return (
    <ResourcesList
      customColumns={customColumns}
      description={
        <Description i18nKey={jobI18nDescriptionKey} url={jobDocsURL} />
      }
      {...props}
      createResourceForm={JobCreate}
      emptyListProps={{
        subtitleText: t('jobs.description'),
        url: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/',
      }}
    />
  );
};

export default JobList;
