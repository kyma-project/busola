import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { VirtualServiceCreate } from './VirtualServiceCreate';

export function VirtualServiceList(props) {
  const { t } = useTranslation();

  // State | Name | Gateways | Hosts | Age - as a starting point
  const customColumns = [
    {
      header: t('virtualservices.hosts'),
      value: service => service.spec.hosts?.join(','),
    },
    {
      header: t('virtualservices.gateways'),
      value: service => service.spec.gateways?.join(','),
    },
  ];

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceTitle={t('virtualservices.title')}
      {...props}
      createResourceForm={VirtualServiceCreate}
    />
  );
}

export default VirtualServiceList;
