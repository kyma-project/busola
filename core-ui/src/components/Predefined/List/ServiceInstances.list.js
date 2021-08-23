import React from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceInstanceStatus } from 'shared/components/ServiceInstanceStatus';

export const ServiceInstancesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('btp-instances.offering-name'),
      value: resource => resource.spec.serviceOfferingName,
    },
    {
      header: t('btp-instances.plan-name'),
      value: resource => resource.spec.servicePlanName,
    },
    {
      header: t('btp-instances.external-name'),
      value: resource => resource.spec.externalName,
    },
    {
      header: t('common.headers.status'),
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
