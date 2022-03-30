import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { VirtualServicesCreate } from '../Create/VirtualServices/VirtualServices.create';
import { Trans } from 'react-i18next';

function VirtualServicesList(props) {
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

  const description = (
    <Trans i18nKey="virtualservices.description">
      <Link
        className="fd-link"
        url="https://istio.io/latest/docs/reference/config/networking/virtual-service/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      resourceName={t('virtualservices.title')}
      createResourceForm={VirtualServicesCreate}
      {...props}
    />
  );
}

export default VirtualServicesList;
