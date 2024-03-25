import { useTranslation } from 'react-i18next';

import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { useMessageList } from 'hooks/useMessageList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { useUrl } from 'hooks/useUrl';
import { Icon, ObjectStatus, Text } from '@ui5/webcomponents-react';
import {
  ResourceDescription,
  docsURL,
  i18nDescriptionKey,
} from 'resources/Events';

export function EventList({
  defaultType,
  hideInvolvedObjects,
  filter,
  isCompact,
  ...props
}) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();
  const resourceType = props.resourceType.toLowerCase();
  const {
    EVENT_MESSAGE_TYPE,
    displayType,
    MessageSelector,
    FormatInvolvedObject,
    FormatSourceObject,
  } = useMessageList(defaultType);

  const involvedObject = hideInvolvedObjects
    ? {}
    : {
        header: t('events.headers.involved-object'),
        value: e => FormatInvolvedObject(e.involvedObject),
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
              <ObjectStatus
                aria-label="Warning"
                icon={<Icon name="error" />}
                className="has-tooltip"
                state="Error"
              />
            </Tooltip>
          ) : (
            <Tooltip content={e.type}>
              <ObjectStatus
                aria-label="Normal"
                name="message-information"
                design="Information"
                className="has-tooltip bsl-icon-m"
                icon={<Icon name="information" />}
                state="Information"
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
      header: t('common.headers.name'),
      value: entry => (
        <Text style={{ fontWeight: 'bold', color: 'var(--sapLinkColor)' }}>
          {entry.metadata?.name}
        </Text>
      ),
      id: 'name',
    },
    {
      ...involvedObject,
    },

    {
      header: t('events.headers.source'),
      value: e => FormatSourceObject(e.source),
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

  return (
    <ResourcesList
      listHeaderActions={MessageSelector}
      columns={customColumns}
      omitColumnsIds={['namespace', 'labels', 'created']}
      sortBy={sortByFn}
      description={ResourceDescription}
      showTitle={isCompact}
      title={t('events.title')}
      {...props}
      isCompact={isCompact}
      hasDetailsView
      readOnly
      filter={res => {
        const typeFilter =
          displayType.key === EVENT_MESSAGE_TYPE.ALL.key ||
          res.type === displayType.key;

        const propsFilter = typeof filter === 'function' ? filter(res) : true;

        return typeFilter && propsFilter;
      }}
      searchSettings={{
        textSearchProperties,
      }}
      customUrl={event =>
        namespaceUrl(`${resourceType}/${event.metadata.name}`, {
          namespace: event.metadata.namespace,
        })
      }
      emptyListProps={{
        showButton: false,
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
      showDefaultColumns={false}
    />
  );
}

export default EventList;
