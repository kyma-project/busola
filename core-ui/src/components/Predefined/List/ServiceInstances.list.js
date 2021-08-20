import React from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceInstanceStatus } from 'shared/components/ServiceInstanceStatus';

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
    {
      header: 'Status',
      value: resource => <ServiceInstanceStatus serviceInstance={resource} />,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      resourceName={t('btp-instances.title')}
      textSearchProperties={[
        'spec.serviceOfferingName',
        'spec.servicePlanName',
        'spec.externalName',
      ]}
      {...otherParams}
    />
  );
};
