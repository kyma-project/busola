import React from 'react';
import { StatusBadge } from 'react-shared';

export const ServiceBrokersList = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Url',
      value: ({ spec }) => spec.url,
    },
    {
      header: 'Status',
      value: ({ status }) => (
        <StatusBadge autoResolveType>{status.lastConditionState}</StatusBadge>
      ),
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
