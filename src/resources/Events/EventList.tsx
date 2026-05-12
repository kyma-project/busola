import { useTranslation } from 'react-i18next';

import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
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
import { CustomColumn } from 'shared/components/ResourcesList/types';
import { SortByObject } from 'shared/components/GenericList/GenericList';

export interface EventListProps {
  resourceType: string;
  resourceUrl: string;
  defaultType?: { key: string; text: string };
  hideInvolvedObjects?: boolean;
  filter?: (resource: any) => boolean;
  isCompact?: boolean;
  isClusterView?: boolean;
  displayArrow?: boolean;
  [key: string]: any;
}

function useEventUrl(resourceType: string, clusterView?: boolean) {
  const { namespaceUrl, clusterUrl } = useUrl();

  if (clusterView) {
    return (resource: any) => {
      return clusterUrl(
        `${pathSegment}/${resource.metadata.namespace}/${resource.metadata.name}`,
      );
    };
  }
  return (resource: any) => {
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
}: EventListProps) {
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

  const textSearchProperties = [
    'metadata.namespace',
    'message',
    'source.component',
    'source.host',
    'involvedObject.kind',
    'involvedObject.name',
  ];

  const customColumns: CustomColumn[] = [
    {
      header: t('events.headers.type'),
      width: '60px',
      value: (e) => (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginRight: '6px',
          }}
        >
          {e.type === 'Warning' ? (
            <ObjectStatus
              aria-label="Warning"
              icon={<Icon accessibleName="Warning" name="warning" />}
              state="Critical"
              title={e.type}
            />
          ) : (
            <ObjectStatus
              aria-label="Normal"
              className="bsl-icon-m"
              icon={<Icon accessibleName="Normal" name="information" />}
              state="Information"
              title={e.type}
            />
          )}
        </div>
      ),
    },
    {
      header: t('events.headers.message'),
      value: (e) => <p>{e.message}</p>,
    },
    {
      header: t('common.headers.name'),
      value: (entry) =>
        isCompact && !props.displayArrow ? (
          <Link
            url={`${customUrl(entry)}`}
            style={{
              fontWeight: 'bold',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {entry.metadata?.name}
          </Link>
        ) : (
          <Text style={{ fontWeight: 'bold', color: 'var(--sapTextColor)' }}>
            {entry.metadata?.name}
          </Text>
        ),
      id: 'name',
    },
    ...(!namespace || namespace === '-all-'
      ? [
          {
            header: t('common.headers.namespace'),
            value: (entry: any) => entry.metadata.namespace,
            id: 'namespace',
          },
        ]
      : []),
    ...(hideInvolvedObjects
      ? []
      : [
          {
            header: t('events.headers.involved-object'),
            value: (e: any) => FormatInvolvedObject(e.involvedObject),
          },
        ]),
    {
      header: t('events.headers.source'),
      value: (e: any) => FormatSourceObject(e.source),
    },
    {
      header: t('events.headers.count'),
      value: (e) => <p>{e.count || EMPTY_TEXT_PLACEHOLDER}</p>,
    },
    {
      header: t('events.headers.last-seen'),
      value: (e) => <ReadableCreationTimestamp timestamp={e.lastTimestamp} />,
    },
  ];

  const sortByFn = (defaultSort: any): SortByObject => {
    const { name } = defaultSort;
    return {
      name,
      type: (a: Record<string, any>, b: Record<string, any>) =>
        a.type.localeCompare(b.type),
      lastseen: (a: Record<string, any>, b: Record<string, any>) =>
        new Date(b.lastTimestamp).getTime() -
        new Date(a.lastTimestamp).getTime(),
      count: (a: Record<string, any>, b: Record<string, any>) =>
        (a.count || 0) - (b.count || 0),
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
      filter={async (res) => {
        const typeFilter =
          displayType.key === EVENT_MESSAGE_TYPE.ALL.key ||
          res.type === displayType.key;

        const propsFilter = filter ? await filter(res) : true;

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
    />
  );
}

export default EventList;
