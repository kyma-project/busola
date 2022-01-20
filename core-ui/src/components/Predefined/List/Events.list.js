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
  Tooltip,
} from 'react-shared';
import { Icon, Link } from 'fundamental-react';
import { useMessageList, EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';

export const EventsList = ({ ...otherParams }) => {
  const description = (
    <Trans i18nKey="events.description">
      <DescriptionLink
        className="fd-link"
        url="https://kubernetes.io/docs/tasks/debug-application-cluster/debug-application-introspection/#example-debugging-pending-pods"
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

export const Events = ({ ...otherParams }) => {
  const { t, i18n } = useTranslation();
  const { resourceUrl } = otherParams;
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
    formatSourceObject,
    navigateToObjectDetails,
  } = useMessageList(items, otherParams.defaultType);

  const entries =
    displayType.key === EVENT_MESSAGE_TYPE.ALL.key
      ? sortedItems
      : sortedItems.filter(e => e.type === displayType.key);

  const headerRenderer = () => [
    t('common.labels.name'),
    t('events.headers.type'),
    t('events.headers.message'),
    t('events.headers.involved-object'),
    t('events.headers.source'),
    t('events.headers.count'),
    t('events.headers.last-seen'),
  ];

  const rowRenderer = entry => [
    <p>
      <Link
        className="fd-link"
        data-testid="details-link"
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
    <p>
      {entry.type === 'Warning' ? (
        <Tooltip content={entry.type}>
          <Icon
            ariaLabel="Warning"
            glyph="message-warning"
            size="s"
            className="fd-has-color-status-2 cursor-pointer"
          />
        </Tooltip>
      ) : (
        <Tooltip content={entry.type}>
          <Icon
            ariaLabel="Normal"
            glyph="message-information"
            size="s"
            className="cursor-pointer"
          />
        </Tooltip>
      )}
    </p>,
    <p>{entry.message}</p>,
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
      notFoundMessage={t('components.generic-list.messages.not-found')}
      noSearchResultMessage={t(
        'components.generic-list.messages.no-search-results',
      )}
      i18n={i18n}
    />
  );
};
