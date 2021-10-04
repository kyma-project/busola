import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export const ServiceAccountsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('api-rules.list.headers.host'),
      value: value => (
        <StatusBadge type="info">
          {value.automountServiceAccountToken ? 'true' : 'false'}
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
