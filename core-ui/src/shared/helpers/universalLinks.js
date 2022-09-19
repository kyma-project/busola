import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';

export const navigateToResource = ({ namespace, name, kind = '' }) => {
  const namespacePrefix = namespace ? `namespaces/${namespace}/` : '';
  const resourceNameDetailsPath =
    kind === 'Namespace' ? `/${name}/details` : `/details/${name}`;

  const path = `${namespacePrefix}${pluralize(
    kind,
  ).toLowerCase()}${resourceNameDetailsPath}`;

  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(path);
};
