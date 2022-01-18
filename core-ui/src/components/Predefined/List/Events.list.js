import React from 'react';
import {
  GenericList,
  useGetList,
  ReadableCreationTimestamp,
} from 'react-shared';
import { useTranslation, Trans } from 'react-i18next';
import {
  Link as DescriptionLink,
  PageHeader,
  prettifyNamePlural,
} from 'react-shared';
import { Link } from 'fundamental-react';
import { useMessageList, EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';

export const EventsList = ({ i18n, ...otherParams }) => {
  // TODO EVENTS DESCRIPTION
  const description = (
    <Trans i18nKey="events.description">
      <DescriptionLink
        className="fd-link"
        url="https://kubernetes.io/docs/tasks/configure-pod-container/attach-handler-lifecycle-event/"
      />
    </Trans>
  );

  return (
    <>
      {!otherParams.isCompact && (
        <PageHeader
          title={prettifyNamePlural(
            otherParams.resourceName,
            otherParams.resourceType,
          )}
          description={description}
        />
      )}
      <Events {...otherParams} />
    </>
  );
};

export const Events = ({ i18n, ...otherParams }) => {
  const { t } = useTranslation();
  const { namespace, resourceUrl } = otherParams;
  console.log('Events', namespace, 'resourceUrl', resourceUrl);

  const { loading = true, error, data: items } = useGetList(otherParams.filter)(
    resourceUrl,
    {
      pollingInterval: 3300,
    },
  );

  const {
    displayType,
    sortedItems,
    messageSelector,
    formatInvolvedObject,
    navigateToObjectDetails,
    navigateToNodeDetails,
  } = useMessageList(items);

  const entries =
    displayType.key === EVENT_MESSAGE_TYPE.ALL.key
      ? sortedItems
      : sortedItems.filter(e => e.type === displayType.key);

  const headerRenderer = () => [
    t('common.labels.name'),
    t('events.headers.type'),
    t('events.headers.message'),
    t('common.labels.namespace'),
    t('events.headers.involved-object'),
    t('events.headers.source'),
    t('events.headers.count'),
    t('events.headers.last-seen'),
  ];
  const formatSourceObject = source => {
    return source?.host ? (
      <Link
        className="fd-link"
        onClick={() => navigateToNodeDetails(source.host)}
      >
        {source.host}
      </Link>
    ) : (
      source?.component
    );
  };

  const rowRenderer = entry => [
    <p>
      <Link
        className="fd-link"
        onClick={() =>
          navigateToObjectDetails({
            namespace: entry.metadata.namespace,
            name: entry.metadata.name,
            kind: 'Event',
          })
        }
      >
        {entry.metadata.name}
      </Link>
    </p>,
    <p>{entry.type}</p>,
    <p>{entry.message}</p>,
    <p>{entry.metadata.namespace}</p>,
    formatInvolvedObject(entry.involvedObject),
    formatSourceObject(entry.source),
    <p>{entry.count}</p>,
    <ReadableCreationTimestamp timestamp={entry.lastTimestamp} />,
  ];

  const textSearchProperties = [
    'metadata.name',
    'metadata.namespace',
    'message',
    'source.component',
    'source.host',
    'involvedObject.kind',
    'involvedObject.name',
  ];

  return (
    <GenericList
      title={t('events.title')}
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
};
