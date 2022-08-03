import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Icon } from 'fundamental-react';

import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Link as DescriptionLink } from 'shared/components/Link/Link';
import { useMessageList } from 'hooks/useMessageList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

export function EventList(props) {
  const { t } = useTranslation();
  const { defaultType, hideInvolvedObjects } = props;

  const {
    EVENT_MESSAGE_TYPE,
    displayType,
    MessageSelector,
    formatInvolvedObject,
    formatSourceObject,
  } = useMessageList(defaultType);

  const involvedObject = hideInvolvedObjects
    ? {}
    : {
        header: t('events.headers.involved-object'),
        value: e => formatInvolvedObject(e.involvedObject),
      };

  const textSearchProperties = [
    'metadata.namespace',
    'message',
    'source.component',
    'source.host',
    'involvedObject.kind',
    'involvedObject.name',
  ];

  const customColumns = [
    {
      header: t('events.headers.type'),
      value: e => (
        <div>
          {e.type === 'Warning' ? (
            <Tooltip content={e.type}>
              <Icon
                ariaLabel="Warning"
                glyph="message-warning"
                size="s"
                className="fd-has-color-status-2 has-tooltip"
              />
            </Tooltip>
          ) : (
            <Tooltip content={e.type}>
              <Icon
                ariaLabel="Normal"
                glyph="message-information"
                size="s"
                className="has-tooltip"
              />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      header: t('events.headers.message'),
      value: e => <p>{e.message}</p>,
    },
    {
      ...involvedObject,
    },
    {
      header: t('events.headers.source'),
      value: e => formatSourceObject(e.source),
    },
    {
      header: t('events.headers.count'),
      value: e => <p>{e.count || EMPTY_TEXT_PLACEHOLDER}</p>,
    },
    {
      header: t('events.headers.last-seen'),
      value: e => <ReadableCreationTimestamp timestamp={e.lastTimestamp} />,
    },
  ];

  const sortByFn = defaultSort => {
    const { name } = defaultSort;
    return {
      name,
      type: (a, b) => a.type.localeCompare(b.type),
      lastseen: (a, b) =>
        new Date(b.lastTimestamp).getTime() -
        new Date(a.lastTimestamp).getTime(),
      count: (a, b) => a.count - b.count,
    };
  };

  const description = (
    <Trans i18nKey="events.description">
      <DescriptionLink
        className="fd-link"
        url="https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      textSearchProperties={textSearchProperties}
      listHeaderActions={[MessageSelector]}
      customColumns={customColumns}
      omitColumnsIds={['namespace', 'labels', 'created']}
      sortBy={sortByFn}
      description={description}
      fixedPath={true}
      showTitle={props.isCompact}
      title={t('events.title')}
      {...props}
      hasDetailsView={true}
      readOnly={true}
      filterFn={res => {
        if (displayType.key === EVENT_MESSAGE_TYPE.ALL.key) return true;
        return res.type === displayType.key;
      }}
    />
  );
}

export default EventList;
