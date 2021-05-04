import React from 'react';
import { modulesExist } from 'react-shared';

import { ComponentForList } from 'shared/getComponents';
import DeployNewWorkload from './DeployNewWorkload';
import { NamespaceStatus } from './NamespaceStatus';
import { NamespaceWorkloads } from './NamespaceWorkloads/NamespaceWorkloads';
import { ResourcesUsage } from './ResourcesUsage';
import './Namespace.details.scss';

export const NamespacesDetails = DefaultRenderer => ({ ...otherParams }) => {
  const { microfrontendContext } = otherParams || {};
  const { crds, modules } = microfrontendContext;
  const limitRangesParams = {
    hasDetailsView: false,
    resourceUrl: `/api/v1/namespaces/${otherParams.resourceName}/limitranges`,
    resourceType: 'LimitRanges',
    namespace: otherParams.resourceName,
    isCompact: true,
    showTitle: true,
  };

  const LimitrangesList = (
    <ComponentForList name="limitrangesList" params={limitRangesParams} />
  );

  const resourceQuotasParams = {
    hasDetailsView: false,
    resourceUrl: `/api/v1/namespaces/${otherParams.resourceName}/resourcequotas`,
    resourceType: 'ResourceQuotas',
    namespace: otherParams.resourceName,
    isCompact: true,
    showTitle: true,
  };

  const ResourceQuotasList = (
    <ComponentForList name="resourcequotaslist" params={resourceQuotasParams} />
  );

  const applicationMappingsParams = {
    hasDetailsView: false,
    resourceUrl: `/apis/applicationconnector.kyma-project.io/v1alpha1/namespaces/${otherParams.resourceName}/applicationmappings`,
    resourceType: 'ApplicationMappings',
    namespace: otherParams.resourceName,
    isCompact: true,
    showTitle: true,
  };

  const ApplicationMappings = modulesExist(crds, [modules?.APPLICATIONS]) ? (
    <ComponentForList
      name="applicationMappingsList"
      params={applicationMappingsParams}
    />
  ) : null;

  const eventsParams = {
    namespace: otherParams.resourceName,
  };

  const Events = <ComponentForList name="eventsList" params={eventsParams} />;

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
      <div className="panel-grid">
        <NamespaceWorkloads namespace={otherParams.resourceName} />
        <ResourcesUsage namespace={otherParams.resourceName} />
      </div>
      {LimitrangesList}
      {ResourceQuotasList}
      {ApplicationMappings}
      {Events}
    </DefaultRenderer>
  );
};
