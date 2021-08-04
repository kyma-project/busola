import React from 'react';
import { Button } from 'fundamental-react';
import { StatusBadge } from 'react-shared';

export const JobsList = ({ DefaultRenderer, ...otherParams }) => {
  const customColumns = [
    {
      header: 'Runs',
      value: job => {
        console.log('job', job);
        const succeeded = job.status.succeeded || 0;
        const completions = job.spec.completions;
        const statusType = succeeded === completions ? 'success' : 'info';
        return (
          <StatusBadge
            type={statusType}
          >{`${succeeded} / ${completions}`}</StatusBadge>
        );
      },
    },
    {
      header: 'Conditions',
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
