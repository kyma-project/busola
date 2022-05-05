import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';

function navigateToResourceDetails(resourceName) {
  LuigiClient.linkManager()
    .fromClosestContext()
    .navigate('/details/' + resourceName);
}

export function navigateToFixedPathResourceDetails(resourceType, resourceName) {
  LuigiClient.linkManager()
    .fromContext('namespace')
    .navigate(`${resourceType}/details/${resourceName}`);
}

export function navigateToClusterResourceDetails(resourceType, resourceName) {
  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(`${resourceType}/details/${resourceName}`);
}

export function navigateToCustomResourceDefinitionDetails(
  resourceType,
  apiVersion,
  resourceName,
) {
  LuigiClient.linkManager()
    .fromContext('namespace')
    .navigate(
      `customresourcedefinitions/details/${resourceType}.${apiVersion}/${resourceName}`,
    );
}

function navigateToNamespaceDetails(namespaceName) {
  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(`namespaces/${namespaceName}/details`);
  LuigiClient.sendCustomMessage({ id: 'busola.refreshNavigation' });
}

export function navigateToDetails(resourceType, name) {
  const encodedName = encodeURIComponent(name);
  switch (resourceType) {
    case 'namespaces':
      navigateToNamespaceDetails(encodedName);
      break;
    default:
      navigateToResourceDetails(encodedName);
  }
}

function navigateToResourceList() {
  LuigiClient.linkManager()
    .fromClosestContext()
    .navigate('/');
}

function navigateToNamespaceList() {
  LuigiClient.linkManager()
    .fromContext('namespaces')
    .navigate('/');
}

function navigateToCustomResourceDefinitionsList() {
  LuigiClient.linkManager()
    .fromContext('customresourcedefinitions')
    .navigate('/');
}

export function navigateToList(resourceType) {
  switch (resourceType) {
    case 'namespaces':
      navigateToNamespaceList();
      break;
    case 'CustomResourceDefinitions':
      navigateToCustomResourceDefinitionsList();
      break;
    default:
      navigateToResourceList();
      break;
  }
}

export function navigateToResource(resource) {
  const {
    metadata: { name, namespace },
    kind,
  } = resource;

  let path = `${pluralize(kind.toLowerCase())}/details/${encodeURIComponent(
    name,
  )}`;
  if (namespace) {
    path = `namespaces/${namespace}/${path}`;
  }
  return LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(path);
}

export function nagivateToResourceAfterCreate(namespace, name, pluralKind) {
  const encodedName = encodeURIComponent(name);
  if (namespace) {
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(`/${pluralKind.toLowerCase()}/details/${encodedName}`);
  } else {
    LuigiClient.linkManager().navigate(
      `details/${encodeURIComponent(encodedName)}`,
    );
  }
}
