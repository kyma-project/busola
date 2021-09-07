import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

export const DNSEntriesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('dnsentries.headers.status'),
      value: dnsprovider => (
        <StatusBadge autoResolveType>
          {dnsprovider.status?.state || 'UNKNOWN'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      resourceName="DNS Entries"
      {...otherParams}
    />
  );
};
