import React from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceAccountTokenStatus } from 'shared/components/ServiceAccountTokenStatus';

export const ServiceAccountsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('service-accounts.list.headers.auto-mount-token'),
      value: value => (
        <ServiceAccountTokenStatus
          accountToken={value.automountServiceAccountToken}
        ></ServiceAccountTokenStatus>
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
