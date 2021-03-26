import React from 'react';

export const ResourceQuotasList = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Limits',
      value: quota => quota.spec.hard['limits.memory'],
    },
    {
      header: 'Requests',
      value: quota => quota.spec.hard['requests.memory'],
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
