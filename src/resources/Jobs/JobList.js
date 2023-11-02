import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { Link } from 'shared/components/Link/Link';

import { JobCompletions } from './JobCompletions';
import { JobCreate } from './JobCreate';

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

  const description = (
    <Trans i18nKey="jobs.description">
      <Link
        className="bsl-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/job/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      {...props}
      createResourceForm={JobCreate}
    />
  );
};

export default JobList;
