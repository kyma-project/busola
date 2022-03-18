import React from 'react';
import { useTranslation } from 'react-i18next';

import { GatewayServers } from './GatewayServers';
import { GatewaySelector } from './GatewaySelector';
import { Selector } from 'shared/components/Selector/Selector';
import { ResourceDetails } from 'react-shared';
import { GatewaysCreate } from '../../Create/Gateways/Gateways.create';

import './GatewaysDetails.scss';

function MatchSelector(gateway) {
  return (
    <Selector
      namespace={gateway.metadata.namespace}
      labels={gateway.spec?.selector}
      selector={gateway.spec?.selector}
      isIstioSelector
    />
  );
}

function GatewaysDetails(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('gateways.selector'),
      value: gateway => <GatewaySelector key="selector" gateway={gateway} />,
    },
  ];

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[GatewayServers, MatchSelector]}
      createResourceForm={GatewaysCreate}
      {...props}
    />
  );
}
export default GatewaysDetails;
