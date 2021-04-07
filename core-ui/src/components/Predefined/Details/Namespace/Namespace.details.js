import React from 'react';

import { Panel, LayoutGrid } from 'fundamental-react';
import { getComponentForList } from 'shared/getComponents';
import DeployNewWorkload from './DeployNewWorkload';
import { NamespaceStatus } from './NamespaceStatus';
import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { MemoryUsageCircle } from './ResourcesUsage';

export const NamespacesDetails = DefaultRenderer => ({ ...otherParams }) => {
  const limitRangesParams = {
    hasDetailsView: false,
    resourceUrl: `/api/v1/namespaces/${otherParams.resourceName}/limitranges`,
    resourceType: 'LimitRanges',
    namespace: otherParams.resourceName,
    isCompact: true,
    showTitle: true,
  };

  const LimitrangesList = getComponentForList({
    name: 'limitrangesList',
    params: limitRangesParams,
  });

  const resourceQuotasParams = {
    hasDetailsView: false,
    resourceUrl: `/api/v1/namespaces/${otherParams.resourceName}/resourcequotas`,
    resourceType: 'ResourceQuotas',
    namespace: otherParams.resourceName,
    isCompact: true,
    showTitle: true,
  };

  const ResourceQuotasList = getComponentForList({
    name: 'resourcequotaslist',
    params: resourceQuotasParams,
  });

  const applicationMappingsParams = {
    hasDetailsView: false,
    resourceUrl: `/apis/applicationconnector.kyma-project.io/v1alpha1/namespaces/${otherParams.resourceName}/applicationmappings`,
    resourceType: 'ApplicationMappings',
    namespace: otherParams.resourceName,
    isCompact: true,
    showTitle: true,
  };

  const ApplicationMappings = getComponentForList({
    name: 'applicationMappingsList',
    params: applicationMappingsParams,
  });

  const eventsParams = {
    namespace: otherParams.resourceName,
  };

  const Events = getComponentForList({
    name: 'eventsList',
    params: eventsParams,
  });

  const headerActions = (
    <DeployNewWorkload namespaceName={otherParams.resourceName} />
  );

  const customColumns = [
    {
      header: 'Status',
      value: namespace => (
        <NamespaceStatus namespaceStatus={namespace.status} />
      ),
    },
  ];

  return (
    <DefaultRenderer
      {...otherParams}
      windowTitle="Overview"
      customColumns={customColumns}
      headerActions={headerActions}
    >
      <NamespaceWorkloads namespace={otherParams.resourceName} />
      <Panel className="fd-has-margin-m">
        <Panel.Header>
          <Panel.Head title="Resource consumption" />
        </Panel.Header>
        <Panel.Body className="namespace-workloads__body">
          <LayoutGrid cols={2}>
            <MemoryUsageCircle namespace={otherParams.resourceName} />
          </LayoutGrid>
        </Panel.Body>
      </Panel>
      {LimitrangesList}
      {ResourceQuotasList}
      {ApplicationMappings}
      {Events}
    </DefaultRenderer>
  );
};
