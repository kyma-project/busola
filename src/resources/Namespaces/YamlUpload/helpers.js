import pluralize from 'pluralize';
export const getResourceKindUrl = resource => {
  const apiVersion =
    resource?.apiVersion || `${resource?.group}/${resource?.version}`;
  return `/${apiVersion === 'v1' ? 'api' : 'apis'}/${apiVersion}`;
};

export const getResourceUrl = (resource, namespace) => {
  if (namespace === undefined || namespace === null) {
    namespace = resource?.metadata?.namespace;
  }

  const apiPath = getResourceKindUrl(resource);
  const namespacePart = namespace ? `/namespaces/${namespace}` : '';
  const resourceType = pluralize(resource?.kind?.toLowerCase() || '');
  return `${apiPath}${namespacePart}/${resourceType}`;
};
