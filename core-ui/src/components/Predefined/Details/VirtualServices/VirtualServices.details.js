import React from 'react';
import { useTranslation } from 'react-i18next';

// import { GatewayServers } from './GatewayServers';
// import { GatewaySelector } from './GatewaySelector';

export function VirtualServicesDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    // {
    // // header: t('gateways.selector'),
    // // value: gateway => <GatewaySelector key="selector" gateway={gateway} />,
    // },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      // customComponents={[GatewayServers]}
      {...otherParams}
    ></DefaultRenderer>
  );
}
