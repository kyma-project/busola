import React from 'react';
// import { useTranslation } from 'react-i18next';

import { ServiceGateways } from './ServiceGateways';
import { ServiceHosts } from './ServiceHosts';
import { HttpRoutes } from './HttpRoutes';
import { TlsRoutes } from './TlsRoutes';
import { TcpRoutes } from './TcpRoutes';

export function VirtualServicesDetails({ DefaultRenderer, ...otherParams }) {
  const customColumns = [
    // {
    // // header: t('gateways.selector'),
    // // value: gateway => <GatewaySelector key="selector" gateway={gateway} />,
    // },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[
        ServiceGateways,
        ServiceHosts,
        HttpRoutes,
        TlsRoutes,
        TcpRoutes,
      ]}
      {...otherParams}
    ></DefaultRenderer>
  );
}
