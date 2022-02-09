export const getResourceKindUrl = resource => {
  return `/${resource?.apiVersion === 'v1' ? 'api' : 'apis'}/${
    resource?.apiVersion
  }`;
};

export const getResourceUrl = (resource, namespace) => {
  return `${getResourceKindUrl(resource)}${
    namespace
      ? '/namespaces/' + namespace
      : resource?.metadata?.namespace
      ? '/namespaces/' + resource.metadata.namespace
      : ''
  }/${resource?.kind?.toLowerCase()}s`;
};
