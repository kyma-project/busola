import React from 'react';

import { ResourceDetails } from 'react-shared';
import { usePrepareDetailsProps } from 'routing/common';
import { VirtualServicesCreate } from '../../Create/VirtualServices/VirtualServices.create';

import { ServiceGateways } from './ServiceGateways';
import { ServiceHosts } from './ServiceHosts';
import { HttpRoutes } from './HttpRoutes';
import { TlsRoutes } from './TlsRoutes';
import { TcpRoutes } from './TcpRoutes';

import './VirtualServicesDetails.scss';

function VirtualServicesDetails() {
  const params = usePrepareDetailsProps('VirtualServices');
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
      {...params}
    />
  );
}
export default VirtualServicesDetails;
