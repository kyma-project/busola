import React from 'react';
import { useGet, GenericList, ReadableCreationTimestamp } from 'react-shared';

export function NodeWarnings({ nodeName }) {
  const { data, loading, error } = useGet('/api/v1/events');

  const warnings = data?.items
    .filter(e => e.type === 'Warning')
    .filter(e => e.source.host === nodeName);

  const headerRenderer = () => ['Message', 'Involved object', 'Timestamp'];
  const rowRenderer = e => [
    e.message,
    `${e.involvedObject.kind} ${e.involvedObject.namespace}/${e.involvedObject.name}`,
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
    />
  );
}
