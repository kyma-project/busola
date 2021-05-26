import React from 'react';
import { useGet, GenericList, ReadableCreationTimestamp } from 'react-shared';

export function NodeWarnings({ nodeName }) {
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
    .filter(e => e.source.host === nodeName);

  const headerRenderer = () => ['Message', 'Involved object', 'Timestamp'];
  const rowRenderer = e => [
    e.message,
    formatInvolvedObject(e.involvedObject),
    <ReadableCreationTimestamp timestamp={e.firstTimestamp} />,
  ];

  return (
    <GenericList
      title="Warnings"
      showSearchField={false}
      showSearchSuggestion={false}
      entries={warnings || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={error}
      serverDataLoading={loading}
      pagination={{ itemsPerPage: 10, autoHide: true }}
    />
  );
}
