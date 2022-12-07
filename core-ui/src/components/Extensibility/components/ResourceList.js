import pluralize from 'pluralize';
import React, { Suspense } from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { prettifyKind } from 'shared/utils/helpers';
import { resources } from 'resources';

import { getTextSearchProperties, useGetTranslation } from '../helpers';
import { sortBy } from '../helpers/sortBy';
import { useJsonata } from '../hooks/useJsonata';
import { getChildren, getSearchDetails, getSortDetails } from './helpers';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { extensionsState } from 'state/navigation/extensionsAtom';
import { useUrl } from 'hooks/useUrl';

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
  scope,
  arrayItems,
  ...props
}) {
  const { widgetT, t } = useGetTranslation();
  const extensions = useRecoilValue(extensionsState);
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const kind = (value?.kind ?? '').replace(/List$/, '');
  const pluralKind = pluralize(kind || '')?.toLowerCase();
  const namespacePart = getProperNamespacePart(value?.namespace, namespaceId);
  const api = value?.apiVersion === 'v1' ? 'api' : 'apis';
  const resourceUrlPrefix = `/${api}/${value?.apiVersion}`;
  const resourceUrl = `${resourceUrlPrefix}${namespacePart}/${pluralKind}`;
  const { scopedUrl } = useUrl();

  const jsonata = useJsonata({
    resource: originalResource,
    scope,
    value,
    arrayItems,
  });

  const extensibilityResourceSchema = extensions?.find(
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
          disableCreate={structure.disableCreate || false}
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
      resourceType={pluralize(kind)}
      resourceTitle={prettifyKind(kind)}
      namespace={value?.namespace || namespaceId}
      isCompact
      title={widgetT(structure)}
      disableCreate={structure.disableCreate || false}
      showTitle={true}
      hasDetailsView={structure.hasDetailsView ?? !!PredefinedRenderer?.Details}
      columns={children}
      sortBy={defaultSortOptions =>
        sortBy(jsonata, sortOptions, t, defaultSort ? defaultSortOptions : {})
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
