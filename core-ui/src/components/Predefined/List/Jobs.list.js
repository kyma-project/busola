import React from 'react';
import { useTranslation } from 'react-i18next';

import { JobCompletions } from '../Details/Job/JobCompletions';

export const JobsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('jobs.completions'),
      value: job => <JobCompletions job={job} />,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
