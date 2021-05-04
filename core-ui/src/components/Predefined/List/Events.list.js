import React from 'react';
import {
  GenericList,
  useGetList,
  ReadableCreationTimestamp,
  useWindowTitle,
} from 'react-shared';

export const EventsList = ({ ...otherParams }) => {
  return <Events namespace={otherParams.namespace} />;
};

function Events({ namespace }) {
  useWindowTitle('Warnings');

  const url = `/api/v1/namespaces/${namespace}/events`;
  const { loading = true, error, data: resources } = useGetList(
    e => e.type === 'Error' || e.type === 'Warning',
  )(url, { pollingInterval: 3300 });

  const events = resources?.sort((e1, e2) => {
    return e1.metadata.creationTimestamp - e2.metadata.creationTimestamp;
  });

  const headerRenderer = () => ['Message', 'Object', 'Object Type', 'Created'];

  const rowRenderer = entry => [
    <p>{entry.message}</p>,
    <p>{entry.involvedObject.name}</p>,
    <p>{entry.involvedObject.kind}</p>,
    <ReadableCreationTimestamp timestamp={entry.metadata.creationTimestamp} />,
  ];

  const textSearchProperties = ['message', 'involvedObject.name'];

  return (
    <GenericList
      title="Warnings"
      textSearchProperties={textSearchProperties}
      entries={events || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={error}
      serverErrorMessage={error?.message}
      serverDataLoading={loading}
      pagination={{ itemsPerPage: 20, autoHide: true }}
    />
  );
}
