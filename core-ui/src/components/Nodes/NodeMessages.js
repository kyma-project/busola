import React from 'react';
import { useGet, GenericList, ReadableCreationTimestamp } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { useMessageList, EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';

export function NodeMessages({ nodeName }) {
  const { data, loading, error } = useGet('/api/v1/events');

  const {
    displayType,
    sortedItems,
    formatInvolvedObject,
    messageSelector,
  } = useMessageList(data?.items);

  const hostEntries = sortedItems.filter(e => e.source.host === nodeName);
  console.log(hostEntries);
  const entries =
    displayType.key === EVENT_MESSAGE_TYPE.ALL.key
      ? hostEntries
      : hostEntries.filter(e => e.type === displayType.key);

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
      title={t('node-details.messages')}
      extraHeaderContent={messageSelector}
      showSearchField={false}
      showSearchSuggestion={false}
      entries={entries}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={error}
      serverDataLoading={loading}
      pagination={{ autoHide: true }}
      i18n={i18n}
    />
  );
}
