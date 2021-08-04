import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

import { JobCompletions } from '../Details/Job/JobCompletions';

export const JobsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('jobs.completions'),
      value: job => <JobCompletions job={job} />,
    },
    {
      header: t('jobs.conditions'),
      value: job => {
        const statusType = status =>
          status === 'Complete' ? 'success' : 'error';
        return (
          <>
            {job.status.conditions?.map((condition, i) => (
              <StatusBadge key={i} type={statusType(condition.type)}>
                {condition.type}
              </StatusBadge>
            ))}
          </>
        );
      },
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
