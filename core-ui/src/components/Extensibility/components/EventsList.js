import { useTranslation } from 'react-i18next';
import { Icon } from 'fundamental-react';
import pluralize from 'pluralize';
import { resources } from 'resources';

import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { useMessageList, EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { prettifyKind } from 'shared/utils/helpers';
import { useGetTranslation } from '../helpers';
import { jsonataWrapper } from '../helpers/jsonataWrapper';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export function EventsList({
  value,
  structure,
  dataSource,
  originalResource,
  schema,
  ...props
}) {
  const { t } = useTranslation();
  const { widgetT } = useGetTranslation();
  const { namespaceId } = useMicrofrontendContext();
  const kind = 'Event';
  const pluralKind = pluralize(kind || '')?.toLowerCase();

  const defaultType = EVENT_MESSAGE_TYPE[structure.defaultType];
  const resourceUrl = namespaceId
    ? `/api/v1/namespaces/${namespaceId}/events`
    : '/api/v1/events';

  const PredefinedRenderer = resources.find(
    r => r.resourceType.toLowerCase() === pluralKind,
  );

  const textSearchProperties = [
    'metadata.namespace',
    'message',
    'source.component',
    'source.host',
    'involvedObject.kind',
    'involvedObject.name',
  ];

  const involvedObject = structure.hideInvolvedObjects
    ? {}
    : {
        header: t('events.headers.involved-object'),
        value: e => formatInvolvedObject(e.involvedObject),
      };

  const defaultCustomColumns = [
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

  // make sure "kind" is present on resources
  if (Array.isArray(value?.items)) {
    value.items = value.items.map(d => ({ ...d, kind }));
  }

  const {
    displayType,
    MessageSelector,
    formatInvolvedObject,
    formatSourceObject,
  } = useMessageList(defaultType);

  return (
    <ResourcesList
      listHeaderActions={[MessageSelector]}
      resourceUrl={resourceUrl}
      resourceType={prettifyKind(kind)}
      resourceTitle={prettifyKind(kind)}
      namespace={namespaceId}
      isCompact
      title={widgetT(structure)}
      showTitle={true}
      hasDetailsView={structure.hasDetailsView ?? !!PredefinedRenderer?.Details}
      fixedPath={true}
      readOnly={true}
      customColumns={defaultCustomColumns}
      omitColumnsIds={['namespace', 'labels', 'created']}
      sortBy={sortByFn}
      searchSettings={{
        textSearchProperties,
      }}
      filter={res => {
        const typeFilter =
          displayType.key === EVENT_MESSAGE_TYPE.ALL.key ||
          res.type === displayType.key;

        let propsFilter = true;
        if (structure.filterBy) {
          const expression = jsonataWrapper(structure.filterBy);
          expression.assign('root', originalResource);
          expression.assign('item', res);
          propsFilter = expression.evaluate();
        }
        return typeFilter && propsFilter;
      }}
      {...structure}
      {...props}
    />
  );
}
