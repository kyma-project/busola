import { useTranslation } from 'react-i18next';

import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { useMessageList } from 'hooks/useMessageList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { useUrl } from 'hooks/useUrl';
import { Icon, ObjectStatus, Text } from '@ui5/webcomponents-react';
import {
  docsURL,
  i18nDescriptionKey,
  ResourceDescription,
} from 'resources/Events';
import { pathSegment } from 'resources/ClusterEvents';
import { Link } from 'shared/components/Link/Link';

function useEventUrl(resourceType, clusterView) {
  const { namespaceUrl, clusterUrl } = useUrl();

  if (clusterView) {
    return resource => {
      return clusterUrl(
        `${pathSegment}/${resource.metadata.namespace}/${resource.metadata.name}`,
      );
    };
  }
  return resource => {
    return namespaceUrl(`${resourceType}/${resource.metadata.name}`, {
      namespace: resource.metadata.namespace,
    });
  };
}

export function EventList({
  defaultType,
  hideInvolvedObjects,
  filter,
  isCompact,
  isClusterView = false,
  ...props
}) {
  const { t } = useTranslation();
  const { namespace } = useUrl();
  const resourceType = props.resourceType.toLowerCase();
  const customUrl = useEventUrl(resourceType, isClusterView);
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
                icon={<Icon accessibleName="Warning" name="warning" />}
                className="has-tooltip"
                state="Critical"
              />
            </Tooltip>
          ) : (
            <Tooltip content={e.type}>
              <ObjectStatus
                aria-label="Normal"
                name="message-information"
                design="Information"
                className="has-tooltip bsl-icon-m"
                icon={<Icon accessibleName="Normal" name="information" />}
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
      value: entry =>
        isCompact && !props.displayArrow ? (
          <Link url={`${customUrl(entry)}`} style={{ fontWeight: 'bold' }}>
            {entry.metadata?.name}
          </Link>
        ) : (
          <Text style={{ fontWeight: 'bold', color: 'var(--sapTextColor)' }}>
            {entry.metadata?.name}
          </Text>
        ),
      id: 'name',
    },
    namespace === '-all-'
      ? {
          header: t('common.headers.namespace'),
          value: entry => entry.metadata.namespace,
          id: 'namespace',
        }
      : null,
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
      customUrl={customUrl}
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
