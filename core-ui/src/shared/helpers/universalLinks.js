import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';

export const navigateToResource = ({ namespace, name, kind }) => {
  const namespacePrefix = namespace ? `namespaces/${namespace}/` : '';

  const path = `${namespacePrefix}${pluralize(
    kind,
  ).toLowerCase()}/details/${name}`;
  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(path);
};
