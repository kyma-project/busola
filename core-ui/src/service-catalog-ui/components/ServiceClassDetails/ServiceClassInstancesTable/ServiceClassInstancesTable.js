import React from 'react';

import LuigiClient from '@luigi-project/client';
import { GenericList, Spinner } from 'react-shared';

import { serviceClassConstants } from 'helpers/constants';
import { ServiceInstanceStatus } from '../../../shared/ServiceInstanceStatus';

import { Link, LinkButton } from './styled';

const ServiceClassInstancesTable = ({ instanceList, i18n }) => {
  if (!instanceList) return <Spinner />;

  function goToServiceInstanceDetails(instanceName) {
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(`instances/details/${instanceName}`);
  }

  const headerRenderer = () => [
    serviceClassConstants.tableHeaderInstance,
    serviceClassConstants.tableHeaderStatus,
  ];

  const rowRenderer = instance => [
    <LinkButton>
      <Link
        className="fd-link"
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
      i18n={i18n}
    />
  );
};
export default ServiceClassInstancesTable;
