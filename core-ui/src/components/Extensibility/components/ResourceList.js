import pluralize from 'pluralize';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { prettifyKind } from 'shared/utils/helpers';
import { resources } from 'resources';
import { sortBy, useGetTranslation } from '../helpers';
import { getChildrenInfo } from './helpers';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

const getProperNamespacePart = (givenNamespace, currentNamespace) => {
  switch (true) {
    case typeof givenNamespace === 'string':
      return `/namespaces/${givenNamespace}`;
    case givenNamespace === null:
      return '';
    default:
      return `/namespaces/${currentNamespace}`;
  }
};
export function ResourceList({
  value,
  structure,
  dataSource,
  originalResource,
  schema,
  ...props
}) {
  const { widgetT, t } = useGetTranslation();
  const { namespaceId } = useMicrofrontendContext();
  const kind = (value?.kind ?? '').replace(/List$/, '');
  const pluralKind = pluralize(kind || '')?.toLowerCase();
  const namespacePart = getProperNamespacePart(value?.namespace, namespaceId);
  const api = value?.apiVersion === 'v1' ? 'api' : 'apis';
  const resourceUrlPrefix = `/${api}/${value?.apiVersion}`;
  const resourceUrl = `${resourceUrlPrefix}${namespacePart}/${pluralKind}`;

  const PredefinedRenderer = resources.find(
    r => r.resourceType.toLowerCase() === pluralKind,
  );

  const ListRenderer = PredefinedRenderer
    ? PredefinedRenderer.List
    : ResourcesList;

  const { children, sortOptions, defaultSort } = getChildrenInfo(
    structure,
    originalResource,
  );

  // make sure "kind" is present on resources
  if (Array.isArray(value?.items)) {
    value.items = value.items.map(d => ({ ...d, kind }));
  }

  return (
    <ListRenderer
      skipDataLoading={true}
      loading={value?.loading}
      error={value?.error}
      resources={value?.items}
      resourceUrl={resourceUrl}
      resourceUrlPrefix={resourceUrlPrefix}
      resourceType={prettifyKind(kind)}
      resourceTitle={prettifyKind(kind)}
      namespace={namespaceId}
      isCompact
      title={widgetT(structure)}
      showTitle={true}
      hasDetailsView={structure.hasDetailsView ?? !!PredefinedRenderer?.Details}
      fixedPath={true}
      {...structure}
      {...props}
      columns={children}
      sortBy={defaultSortOptions =>
        sortBy(sortOptions, t, defaultSort ? defaultSortOptions : {})
      }
    />
  );
}
