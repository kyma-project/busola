import pluralize from 'pluralize';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { prettifyKind } from 'shared/utils/helpers';
import { resources } from 'resources';
import { Widget } from './Widget';

export function ResourceList({
  value,
  relations,
  structure,
  relation,
  originalResource,
  schema,
  ...props
}) {
  const namespace =
    typeof relation.namespace === 'undefined'
      ? originalResource.metadata.namespace
      : relation.namespace;
  const { group, kind, version } = relation;
  const namespacePart = namespace ? `/namespaces/${namespace}` : '';
  const resourceUrl = `/${group}/${version}${namespacePart}/${pluralize(
    kind,
  ).toLowerCase()}`;

  const PredefinedRenderer = resources.find(
    r => r.resourceType.toLowerCase() === pluralize(kind).toLowerCase(),
  );
  const ListRenderer = PredefinedRenderer
    ? PredefinedRenderer.List
    : ResourcesList;

  let columns;
  if (Array.isArray(structure.columns)) {
    columns = structure.columns.map(({ name, ...props }) => ({
      header: name,
      value: value => <Widget value={value} structure={props} />,
    }));
  }

  return (
    <ListRenderer
      skipDataLoading={true}
      loading={value.loading}
      error={value.error}
      resources={value.data}
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
