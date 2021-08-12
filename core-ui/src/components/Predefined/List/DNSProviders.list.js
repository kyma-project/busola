import React from 'react';
import { StatusBadge } from 'react-shared';

export const DNSProvidersList = ({ DefaultRenderer, ...otherParams }) => {
  const customColumns = [
    {
      header: 'Type',
      value: dnsprovider => {
        return dnsprovider.spec.type;
      },
    },
    {
      header: 'Status',
      value: dnsprovider => (
        <StatusBadge autoResolveType>{dnsprovider.status?.state}</StatusBadge>
      ),
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
