import React from 'react';
import { useTranslation } from 'react-i18next';

export const ServiceInstancesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: 'Offering name',
      value: resource => resource.spec.serviceOfferingName,
    },
    {
      header: 'Plan name',
      value: resource => resource.spec.servicePlanName,
    },
    {
      header: 'External name',
      value: resource => resource.spec.externalName,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      resourceName={t('btp-instances.title')}
      {...otherParams}
    />
  );
};
