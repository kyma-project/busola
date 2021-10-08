import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export const ServiceAccountsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('service-accounts.list.headers.auto-mount-token'),
      value: value => (
        <StatusBadge type="info">
          {value.automountServiceAccountToken ? 'enabled' : 'disabled'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      resourceName={t('service-accounts.title')}
      {...otherParams}
    />
  );
};
