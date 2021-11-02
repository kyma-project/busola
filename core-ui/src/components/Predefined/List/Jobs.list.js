import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';

import { JobCompletions } from '../Details/Job/JobCompletions';

export const JobsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('jobs.completions'),
      value: job => <JobCompletions job={job} />,
    },
  ];

  const description = (
    <span>
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/job/"
        text="Job"
      />
      {t('jobs.description')}
    </span>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
