import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Icon, Link } from 'fundamental-react';

import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { prettifyNamePlural } from 'shared/utils/helpers';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Link as DescriptionLink } from 'shared/components/Link/Link';
import { useMessageList, EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { setWindowTitle } from 'shared/hooks/useWindowTitle';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

function Events({ ...otherParams }) {
  const { t, i18n } = useTranslation();
  const {
    defaultType,
    hideInvolvedObjects,
    resourceUrl,
    allowSlashShortcut,
    updateTitle = true,
  } = otherParams;

  if (updateTitle) {
    setWindowTitle(t('events.title'));
  }
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
  } = useMessageList(items, defaultType);

  const entries =
    displayType.key === EVENT_MESSAGE_TYPE.ALL.key
      ? sortedItems
      : sortedItems.filter(e => e.type === displayType.key);

  const involvedObjectHeader = hideInvolvedObjects
    ? []
    : [t('events.headers.involved-object')];
  const involvedObject = entry =>
    hideInvolvedObjects ? [] : [formatInvolvedObject(entry.involvedObject)];
  const headerRenderer = () => [
    t('common.labels.name'),
    t('events.headers.type'),
    t('events.headers.message'),
    ...involvedObjectHeader,
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
    <div>
      {entry.type === 'Warning' ? (
        <Tooltip content={entry.type}>
          <Icon
            ariaLabel="Warning"
            glyph="message-warning"
            size="s"
            className="fd-has-color-status-2 has-tooltip"
          />
        </Tooltip>
      ) : (
        <Tooltip content={entry.type}>
          <Icon
            ariaLabel="Normal"
            glyph="message-information"
            size="s"
            className="has-tooltip"
          />
        </Tooltip>
      )}
    </div>,
    <p>{entry.message}</p>,
    ...involvedObject(entry),
    formatSourceObject(entry.source),
    <p>{entry.count || EMPTY_TEXT_PLACEHOLDER}</p>,
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
      allowSlashShortcut={allowSlashShortcut}
      sortBy={defaultSort => {
        const { name } = defaultSort;

        return {
          name,
          type: (a, b) => a.type.localeCompare(b.type),
          lastseen: (a, b) =>
            new Date(b.lastTimestamp).getTime() -
            new Date(a.lastTimestamp).getTime(),
          count: (a, b) => a.count - b.count,
        };
      }}
    />
  );
}

export function EventList(props) {
  const description = (
    <Trans i18nKey="events.description">
      <DescriptionLink
        className="fd-link"
        url="https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/"
      />
    </Trans>
  );

  return (
    <>
      {!props.isCompact && (
        <PageHeader
          title={prettifyNamePlural(props.resourceName, props.resourceType)}
          description={description}
        />
      )}
      <Events {...props} />
    </>
  );
}

export default EventList;
