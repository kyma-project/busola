import pluralize from 'pluralize';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { prettifyKind } from 'shared/utils/helpers';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { resources } from 'resources';

import { getTextSearchProperties, useGetTranslation } from '../helpers';
import { sortBy } from '../helpers/sortBy';
import { useJsonata } from '../hooks/useJsonata';
import { getChildren, getSearchDetails, getSortDetails } from './helpers';
import { ExtensibilityCreate } from '../ExtensibilityCreate';

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
  scope,
  arrayItems,
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
  const jsonata = useJsonata({
    resource: originalResource,
    scope,
    value,
    arrayItems,
  });

  const PredefinedRenderer = resources.find(
    r => r.resourceType.toLowerCase() === pluralKind,
  );

  const ListRenderer = PredefinedRenderer
    ? PredefinedRenderer.List
    : ResourcesList;

  const children = getChildren(structure, originalResource);

  const { sortOptions, defaultSort } = getSortDetails(structure);

  const { searchOptions, defaultSearch } = getSearchDetails(structure);

  const textSearchProperties = getTextSearchProperties({
    searchOptions,
    defaultSearch,
  });

  // make sure "kind" is present on resources
  if (Array.isArray(value?.items)) {
    value.items = value.items.map(d => ({ ...d, kind }));
  }

  const resourceSchema = {
    general: {
      resource: {
        kind: kind,
        version: value?.apiVersion,
        group: value?.group,
      },
    },
  };

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
      columns={children}
      sortBy={defaultSortOptions =>
        sortBy(jsonata, sortOptions, t, defaultSort ? defaultSortOptions : {})
      }
      createFormProps={{ resourceSchema }}
      createResourceForm={ExtensibilityCreate}
      searchSettings={{
        textSearchProperties: defaultSortOptions =>
          textSearchProperties(defaultSortOptions),
      }}
      {...structure}
      {...props}
    />
  );
}
