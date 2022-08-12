import pluralize from 'pluralize';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { prettifyKind } from 'shared/utils/helpers';
import { resources } from 'resources';

import { Widget } from './Widget';

export function ResourceList({
  value,
  structure,
  dataSource,
  originalResource,
  schema,
  ...props
}) {
  const kind = (value?.kind ?? '').replace(/List$/, '');
  const namespace = value?.namespace;
  const namespacePart = namespace ? `/namespaces/${namespace}` : '';
  const resourceUrl = `/${value?.apiVersion}${namespacePart}/${kind}`;

  const PredefinedRenderer = resources.find(
    r => r.resourceType.toLowerCase() === pluralize(kind).toLowerCase(),
  );
  const ListRenderer = PredefinedRenderer
    ? PredefinedRenderer.List
    : ResourcesList;

  let columns;
  if (Array.isArray(structure.children)) {
    columns = structure.children.map(({ name, ...props }) => ({
      header: name,
      value: value => <Widget value={value} structure={props} />,
    }));
  }

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
      resourceType={prettifyKind(kind)}
      resourceName={prettifyKind(kind)}
      namespace={namespace}
      isCompact
      title={structure.name}
      showTitle={true}
      hasDetailsView={structure.hasDetailsView ?? !!PredefinedRenderer?.Details}
      fixedPath={true}
      {...structure}
      {...props}
      columns={columns}
    />
  );
}
