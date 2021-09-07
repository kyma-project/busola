import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { useGet, GenericList, ReadableCreationTimestamp } from 'react-shared';
import { useTranslation } from 'react-i18next';

export function ClusterNodesWarnings({ nodesNames }) {
  const { i18n } = useTranslation();
  const { data, loading, error } = useGet('/api/v1/events');

  const formatInvolvedObject = obj => {
    if (obj.namespace) {
      return `${obj.kind} ${obj.namespace}/${obj.name}`;
    } else {
      return `${obj.kind} ${obj.name}`;
    }
  };

  const warnings = data?.items
    .filter(e => e.type === 'Warning')
    .filter(e => nodesNames.includes(e.source.host));

  const navigateToNodeDetails = nodeName => {
    LuigiClient.linkManager().navigate(`nodes/${nodeName}`);
  };

  const headerRenderer = () => [
    'Message',
    'Node',
    'Involved object',
    'Timestamp',
  ];

  const rowRenderer = e => [
    <p style={{ maxWidth: '50vw' }}>{e.message}</p>,
    <Link
      className="fd-link"
      onClick={() => navigateToNodeDetails(e.source.host)}
    >
      {e.source.host}
    </Link>,
    formatInvolvedObject(e.involvedObject),
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
      pagination={{ itemsPerPage: 10, autoHide: true }}
      i18n={i18n}
    />
  );
}
