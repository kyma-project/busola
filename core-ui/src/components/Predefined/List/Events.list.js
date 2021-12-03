import React from 'react';
import {
  GenericList,
  useGetList,
  ReadableCreationTimestamp,
} from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'fundamental-react';
import {
  useMessageList,
  EVENT_MESSAGE_TYPE,
  RESOURCE_PATH,
} from 'hooks/useMessageList';

export const EventsList = ({ i18n, ...otherParams }) => {
  return <Events namespace={otherParams.namespace} i18n={i18n} />;
};

function Events({ namespace, i18n }) {
  const { t } = useTranslation();

  const url = `/api/v1/namespaces/${namespace}/events`;
  const { loading = true, error, data: items } = useGetList()(url, {
    pollingInterval: 3300,
  });

  const {
    displayType,
    sortedItems,
    messageSelector,
    navigateToObjectDetails,
  } = useMessageList(items);

  const formatInvolvedObject = obj => {
    const isLink = !!RESOURCE_PATH[obj.kind];
    return isLink ? (
      <Link className="fd-link" onClick={() => navigateToObjectDetails(obj)}>
        {obj.name}
      </Link>
    ) : (
      obj.name
    );
  };

  const entries =
    displayType === EVENT_MESSAGE_TYPE.ALL
      ? sortedItems
      : sortedItems.filter(e => e.type === displayType.type);

  const headerRenderer = () => [
    t('namespaces.events.headers.message'),
    t('namespaces.events.headers.object'),
    t('namespaces.events.headers.object-type'),
    t('namespaces.events.headers.created'),
  ];

  const rowRenderer = entry => [
    <p>{entry.message}</p>,
    formatInvolvedObject(entry.involvedObject),
    <p>{entry.involvedObject.kind}</p>,
    <ReadableCreationTimestamp timestamp={entry.metadata.creationTimestamp} />,
  ];

  const textSearchProperties = ['message', 'involvedObject.name'];

  return (
    <GenericList
      title={t(`node-details.${displayType.label}`)}
      textSearchProperties={textSearchProperties}
      extraHeaderContent={messageSelector}
      entries={entries}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={error}
      serverErrorMessage={error?.message}
      serverDataLoading={loading}
      pagination={{ autoHide: true }}
      i18n={i18n}
    />
  );
}
