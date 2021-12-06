import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { useGet, GenericList, ReadableCreationTimestamp } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { useMessageList, EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';

export function ClusterNodeMessages() {
  const { i18n, t } = useTranslation();
  const { data, loading, error } = useGet('/api/v1/events');

  const {
    displayType,
    sortedItems,
    formatInvolvedObject,
    messageSelector,
  } = useMessageList(data?.items);

  const entries =
    displayType === EVENT_MESSAGE_TYPE.ALL.key
      ? sortedItems
      : sortedItems.filter(e => e.type === displayType);

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
      title={t(`node-details.${displayType.label}`)}
      extraHeaderContent={messageSelector}
      textSearchProperties={searchProperties}
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
