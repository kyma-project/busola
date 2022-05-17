import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ExternalLink } from 'shared/components/Link/ExternalLink';
import { GatewayCreate } from './GatewayCreate';
import { GatewaySelector } from './GatewaySelector';
import { Trans } from 'react-i18next';

export function GatewayList(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('gateways.selector'),
      value: gateway => <GatewaySelector key="selector" gateway={gateway} />,
    },
  ];

  const description = (
    <Trans i18nKey="gateways.description">
      <ExternalLink
        className="fd-link"
        url="https://istio.io/latest/docs/reference/config/networking/gateway/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={GatewayCreate}
      {...props}
    />
  );
}

export default GatewayList;
