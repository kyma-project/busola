import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { GatewaysCreate } from '../Create/Gateways/Gateways.create';
import { GatewaySelector } from '../Details/Gateway/GatewaySelector';
import { Trans } from 'react-i18next';

function GatewaysList(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('gateways.selector'),
      value: gateway => <GatewaySelector key="selector" gateway={gateway} />,
    },
  ];

  const description = (
    <Trans i18nKey="gateways.description">
      <Link
        className="fd-link"
        url="https://istio.io/latest/docs/reference/config/networking/gateway/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={GatewaysCreate}
      {...props}
    />
  );
}

export default GatewaysList;
