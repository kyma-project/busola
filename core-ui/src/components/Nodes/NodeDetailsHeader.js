import React from 'react';
import { PageHeader, ReadableCreationTimestamp } from 'react-shared';

export function NodeDetailsHeader({ nodeName, node, loading, error }) {
  const breadcrumbs = [
    {
      name: 'Cluster Overview - Nodes',
      path: '/overview',
      fromContext: 'cluster',
    },
    { name: '' },
  ];

  const internalIP = node?.status.addresses.find(a => a.type === 'InternalIP');
  const hostname = node?.status.addresses.find(a => a.type === 'Hostname');

  return (
    <PageHeader title={nodeName} breadcrumbItems={breadcrumbs}>
      {loading && 'Loading...'}
      {error && error.message}
      {node && (
        <>
          <PageHeader.Column title="Created">
            <ReadableCreationTimestamp
              timestamp={node.metadata.creationTimestamp}
            />
          </PageHeader.Column>
          <PageHeader.Column title="Pod CIDR">
            {node.spec.podCIDR}
          </PageHeader.Column>
          <PageHeader.Column title="Internal IP">
            {internalIP.address}
          </PageHeader.Column>
          <PageHeader.Column title="Hostname">
            {hostname.address}
          </PageHeader.Column>
        </>
      )}
    </PageHeader>
  );
}
