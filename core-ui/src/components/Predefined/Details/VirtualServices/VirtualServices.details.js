import React from 'react';

import { ServiceGateways } from './ServiceGateways';
import { ServiceHosts } from './ServiceHosts';
import { HttpRoutes } from './HttpRoutes';
import { TlsRoutes } from './TlsRoutes';
import { TcpRoutes } from './TcpRoutes';

export function VirtualServicesDetails({ DefaultRenderer, ...otherParams }) {
  return (
    <DefaultRenderer
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
