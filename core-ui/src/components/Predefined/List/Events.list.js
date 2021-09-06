import React from 'react';
import {
  GenericList,
  useGetList,
  ReadableCreationTimestamp,
} from 'react-shared';
import { useTranslation } from 'react-i18next';

export const EventsList = ({ i18n, ...otherParams }) => {
  return <Events namespace={otherParams.namespace} i18n={i18n} />;
};

function Events({ namespace, i18n }) {
  const { t } = useTranslation();

  const url = `/api/v1/namespaces/${namespace}/events`;
  const { loading = true, error, data: resources } = useGetList(
    e => e.type === 'Error' || e.type === 'Warning',
  )(url, { pollingInterval: 3300 });

  const events = resources?.sort((e1, e2) => {
    return e1.metadata.creationTimestamp - e2.metadata.creationTimestamp;
  });

  const headerRenderer = () => [
    t('namespaces.events.headers.message'),
    t('namespaces.events.headers.object'),
    t('namespaces.events.headers.object-type'),
    t('namespaces.events.headers.created'),
  ];

  const rowRenderer = entry => [
    <p>{entry.message}</p>,
    <p>{entry.involvedObject.name}</p>,
    <p>{entry.involvedObject.kind}</p>,
    <ReadableCreationTimestamp timestamp={entry.metadata.creationTimestamp} />,
  ];

  const textSearchProperties = ['message', 'involvedObject.name'];

  return (
    <GenericList
      title={t('namespaces.events.title')}
      textSearchProperties={textSearchProperties}
      entries={events || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={error}
      serverErrorMessage={error?.message}
      serverDataLoading={loading}
      pagination={{ itemsPerPage: 10, autoHide: true }}
      i18n={i18n}
    />
  );
}
