import React from 'react';

import { ResourceDetails } from 'react-shared';
import { VirtualServicesCreate } from '../../Create/VirtualServices/VirtualServices.create';

import { ServiceGateways } from './ServiceGateways';
import { ServiceHosts } from './ServiceHosts';
import { HttpRoutes } from './HttpRoutes';
import { TlsRoutes } from './TlsRoutes';
import { TcpRoutes } from './TcpRoutes';

import './VirtualServicesDetails.scss';

function VirtualServicesDetails(props) {
  return (
    <ResourceDetails
      customComponents={[
        ServiceGateways,
        ServiceHosts,
        HttpRoutes,
        TlsRoutes,
        TcpRoutes,
      ]}
      createResourceForm={VirtualServicesCreate}
      {...props}
    />
  );
}
export default VirtualServicesDetails;
