import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { useGet, GenericList, ReadableCreationTimestamp } from 'react-shared';

export function ClusterNodesWarnings({ nodesNames }) {
  const { data, loading, error } = useGet('/api/v1/events');

  const warnings = data?.items
    .filter(e => e.type === 'Warning')
    .filter(e => nodesNames.includes(e.source.host));

  function navigateToNodeDetails(nodeName) {
    LuigiClient.linkManager().navigate(`nodes/${nodeName}`);
  }

  const headerRenderer = () => [
    'Message',
    'Node',
    'Involved object',
    'Timestamp',
  ];

  const rowRenderer = e => [
    e.message,
    <Link className="link" onClick={() => navigateToNodeDetails(e.source.host)}>
      {e.source.host}
    </Link>,
    `${e.involvedObject.kind} ${e.involvedObject.namespace}/${e.involvedObject.name}`,
    <ReadableCreationTimestamp timestamp={e.firstTimestamp} />,
  ];

  const searchProperties = [
    'message',
    'source.host',
    'involvedObject.kind',
    'involvedObject.name',
  ];

  return (
    <GenericList
      title="Warnings"
      textSearchProperties={searchProperties}
      entries={warnings || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={error}
      serverDataLoading={loading}
    />
  );
}
