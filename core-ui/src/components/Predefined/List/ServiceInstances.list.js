import React from 'react';
import { useTranslation } from 'react-i18next';
import { BTPResourceStatus } from 'shared/components/BTPResourceStatus';
import { CreateServiceInstanceModal } from 'shared/components/CreateServiceInstanceModal/CreateServiceInstanceModal';

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
      value: resource => <BTPResourceStatus status={resource.status} />,
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
      listHeaderActions={
        <CreateServiceInstanceModal namespaceId={otherParams.namespace} />
      }
      {...otherParams}
    />
  );
};
