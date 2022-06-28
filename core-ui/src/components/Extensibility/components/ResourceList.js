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
  const namespace = relation.namespaced ?? originalResource.metadata.namespace;
  const { group, kind, version } = relation;

  const PredefinedList = resources.find(
    r => r.resourceType.toLowerCase() === pluralize(kind).toLowerCase(),
  )?.List;
  const Renderer = PredefinedList ? PredefinedList : ResourcesList;

  const namespacePart = namespace ? `/namespaces/${namespace}` : '';
  const resourceUrl = `/${group}/${version}${namespacePart}/${pluralize(
    kind,
  ).toLowerCase()}`;

  let columns;
  if (Array.isArray(structure.columns)) {
    columns = structure.columns.map(({ name, ...props }) => ({
      header: name,
      value: value => <Widget value={value} structure={props} />,
    }));
  }

  return (
    <Renderer
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
      {...structure}
      {...props}
      columns={columns}
    />
  );
}
