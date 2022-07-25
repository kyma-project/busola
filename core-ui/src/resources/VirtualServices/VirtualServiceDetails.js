import React from 'react';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { VirtualServiceCreate } from './VirtualServiceCreate';

import { ServiceGateways } from './ServiceGateways';
import { ServiceHosts } from './ServiceHosts';
import { HttpRoutes } from './HttpRoutes';
import { TlsRoutes } from './TlsRoutes';
import { TcpRoutes } from './TcpRoutes';

import './VirtualServiceDetails.scss';

export function VirtualServiceDetails(props) {
  return (
    <ResourceDetails
      customComponents={[
        ServiceGateways,
        ServiceHosts,
        HttpRoutes,
        TlsRoutes,
        TcpRoutes,
      ]}
      createResourceForm={VirtualServiceCreate}
      {...props}
    />
  );
}
export default VirtualServiceDetails;
