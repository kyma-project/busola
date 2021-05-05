import React from 'react';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

export const ResourceQuotasList = ({ DefaultRenderer, ...otherParams }) => {
  const customColumns = [
    {
      header: 'Limits',
      value: quota =>
        quota.spec.hard['limits.memory'] || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: 'Requests',
      value: quota =>
        quota.spec.hard['requests.memory'] || EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return (
    <DefaultRenderer
      resourceName="Resource Quotas"
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
