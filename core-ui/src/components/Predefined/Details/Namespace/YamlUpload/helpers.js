import pluralize from 'pluralize';

export const getResourceKindUrl = resource => {
  return `/${resource?.apiVersion === 'v1' ? 'api' : 'apis'}/${
    resource?.apiVersion
  }`;
};

export const getResourceUrl = (resource, namespace) => {
  if (!namespace) {
    namespace = resource?.metadata?.namespace;
  }

  const apiPath = getResourceKindUrl(resource);
  const namespacePart = namespace ? `/namespaces/${namespace}` : '';
  const resourceType = pluralize(resource?.kind?.toLowerCase());

  return `${apiPath}${namespacePart}/${resourceType}`;
};
