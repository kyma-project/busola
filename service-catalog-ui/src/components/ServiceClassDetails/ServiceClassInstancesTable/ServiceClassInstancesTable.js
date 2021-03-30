import React, { Component } from 'react';

import LuigiClient from '@luigi-project/client';
import { GenericList, StatusBadge, Spinner } from 'react-shared';

import { serviceClassConstants } from 'helpers/constants';
import { getBadgeTypeForStatus } from 'helpers/getBadgeTypeForStatus';
import { ServiceInstanceStatus } from '../../../shared/ServiceInstanceStatus';

import { Link, LinkButton } from './styled';

const ServiceClassInstancesTable = ({ instanceList }) => {
  if (!instanceList) return <Spinner />;

  function goToServiceInstanceDetails(instanceName) {
    LuigiClient.linkManager()
      .fromContext('namespaces')
      .navigate(`instances/details/${instanceName}`);
  }

  const headerRenderer = () => [
    serviceClassConstants.tableHeaderInstance,
    serviceClassConstants.tableHeaderStatus,
  ];

  const rowRenderer = instance => [
    <LinkButton>
      <Link
        onClick={() => goToServiceInstanceDetails(instance.metadata.name)}
        title={instance.metadata.name}
      >
        {instance.metadata.name}
      </Link>
    </LinkButton>,
    <ServiceInstanceStatus instance={instance} />,
  ];

  return (
    <GenericList
      textSearchProperties={['metadata.name']}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={instanceList}
      notFoundMessage={serviceClassConstants.emptyInstancesListMessage}
      title="Service Instances"
    />
  );
};
export default ServiceClassInstancesTable;
