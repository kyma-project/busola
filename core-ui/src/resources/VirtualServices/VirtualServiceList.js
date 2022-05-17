import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ExternalLink } from 'shared/components/Link/ExternalLink';
import { VirtualServiceCreate } from './VirtualServiceCreate';
import { Trans } from 'react-i18next';

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

  const description = (
    <Trans i18nKey="virtualservices.description">
      <ExternalLink
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
      createResourceForm={VirtualServiceCreate}
      {...props}
    />
  );
}

export default VirtualServiceList;
