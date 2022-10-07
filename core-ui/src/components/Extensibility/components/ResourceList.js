import pluralize from 'pluralize';
import React, { Suspense } from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { prettifyKind } from 'shared/utils/helpers';
import { resources } from 'resources';
import { getTextSearchProperties, sortBy, useGetTranslation } from '../helpers';
import { getChildren, getSearchDetails, getSortDetails } from './helpers';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { Spinner } from 'shared/components/Spinner/Spinner';

const ExtensibilityList = React.lazy(() => import('../ExtensibilityList'));

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
  const { namespaceId, customResources } = useMicrofrontendContext();
  const kind = (value?.kind ?? '').replace(/List$/, '');
  const pluralKind = pluralize(kind || '')?.toLowerCase();
  const namespacePart = getProperNamespacePart(value?.namespace, namespaceId);
  const api = value?.apiVersion === 'v1' ? 'api' : 'apis';
  const resourceUrlPrefix = `/${api}/${value?.apiVersion}`;
  const resourceUrl = `${resourceUrlPrefix}${namespacePart}/${pluralKind}`;
  console.log(value);

  const extensibilityResourceSchema = customResources.find(
    cR => cR.general?.resource?.kind === kind,
  );

  const PredefinedRenderer = resources.find(
    r => r.resourceType.toLowerCase() === pluralKind,
  );

  if (!structure.children && extensibilityResourceSchema)
    return (
      <Suspense fallback={<Spinner />}>
        <ExtensibilityList
          overrideResMetadata={extensibilityResourceSchema || {}}
          isCompact
          resourceUrl={resourceUrl}
          hasDetailsView
          showTitle
          skipDataLoading
          resources={value?.items}
          error={value?.error}
          loading={value?.loading}
          title={t(structure.name)}
          fixedPath
        />
      </Suspense>
    );

  const ListRenderer = PredefinedRenderer?.List || ResourcesList;

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
        sortBy(sortOptions, t, defaultSort ? defaultSortOptions : {})
      }
      searchSettings={{
        textSearchProperties: defaultSortOptions =>
          textSearchProperties(defaultSortOptions),
      }}
      {...structure}
      {...props}
    />
  );
}
