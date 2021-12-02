import React from 'react';
import { useGet, GenericList, ReadableCreationTimestamp } from 'react-shared';
import { useTranslation } from 'react-i18next';

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

  const { t, i18n } = useTranslation();
  const headerRenderer = () => [
    t('node-details.message'),
    t('node-details.involved-object'),
    t('node-details.timestamp'),
  ];
  const rowRenderer = e => [
    e.message,
    formatInvolvedObject(e.involvedObject),
    <ReadableCreationTimestamp timestamp={e.firstTimestamp} />,
  ];

  return (
    <GenericList
      title={t('node-details.title-warnings')}
      showSearchField={false}
      showSearchSuggestion={false}
      entries={warnings || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={error}
      serverDataLoading={loading}
      pagination={{ autoHide: true }}
      i18n={i18n}
    />
  );
}
