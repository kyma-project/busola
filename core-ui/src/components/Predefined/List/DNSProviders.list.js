import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

export const DNSProvidersList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('dnsproviders.headers.type'),
      value: dnsprovider => {
        return dnsprovider.spec.type;
      },
    },
    {
      header: t('dnsproviders.headers.status'),
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
      resourceName="DNS Providers"
      {...otherParams}
    />
  );
};
