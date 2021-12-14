import React from 'react';
// import { useTranslation } from 'react-i18next';

import { ServiceGateways } from './ServiceGateways';
import { ServiceHosts } from './ServiceHosts';
import { HttpRoutes } from './ServiceRoutesHttp';

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
      customComponents={[ServiceGateways, ServiceHosts, HttpRoutes]}
      {...otherParams}
    ></DefaultRenderer>
  );
}
