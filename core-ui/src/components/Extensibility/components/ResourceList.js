import pluralize from 'pluralize';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { prettifyKind } from 'shared/utils/helpers';
import { resources } from 'resources';
import { Widget } from './Widget';

function extractResourceData({ dataSource, originalResource }) {
  try {
    let { group, kind, version, namespace } = dataSource.resource;
    namespace =
      typeof namespace === 'undefined'
        ? originalResource.metadata.namespace
        : namespace;
    const namespacePart = namespace ? `/namespaces/${namespace}` : '';
    const apiGroup = group ? `apis/${group}` : 'api';
    const resourceType = pluralize(kind).toLowerCase();
    const resourceUrl = `/${apiGroup}/${version}${namespacePart}/${resourceType}`;

    return { kind, resourceType, resourceUrl, namespace };
  } catch (error) {
    return { error };
  }
}

export function ResourceList({
  value,
  structure,
  dataSource,
  originalResource,
  schema,
  ...props
}) {
  console.log('ResourcesList', value);
  const kind = (value?.kind ?? '').replace(/List$/, '');
  // const resourceUrl = `/${apiVersion}/${namespacePart}/${resourceType}`;
  const resourceUrl = `/${value.apiVersion}/${kind}`;
  /*
  const {
    kind,
    resourceType,
    resourceUrl,
    namespace,
    error,
  } = extractResourceData({ dataSource, originalResource });

  if (error) {
    throw Error('Error in ResourceList: ' + error.message);
  }
  */

  const PredefinedRenderer = resources.find(
    r => r.resourceType.toLowerCase() === kind,
  );
  const ListRenderer = PredefinedRenderer
    ? PredefinedRenderer.List
    : ResourcesList;

  /*
  let columns;
  if (Array.isArray(structure.columns)) {
    columns = structure.columns.map(({ name, ...props }) => ({
      header: name,
      value: value => <Widget value={value} structure={props} />,
    }));
  }

  // make sure "kind" is present on resources
  if (Array.isArray(value.data)) {
    value.data = value.data.map(d => ({ ...d, kind }));
  }
  */

  return (
    <ListRenderer
      skipDataLoading={true}
      // loading={value.loading}
      // error={value.error}
      resources={value.items}
      resourceUrl={resourceUrl}
      resourceType={prettifyKind(kind)}
      resourceName={prettifyKind(kind)}
      // namespace={namespace}
      isCompact
      title={structure.name}
      showTitle={true}
      hasDetailsView={structure.hasDetailsView ?? !!PredefinedRenderer?.Details}
      fixedPath={true}
      {...structure}
      {...props}
      // columns={columns}
    />
  );
  return (
    <ul>
      <li>kind: {kind}</li>
    </ul>
  );
}
