import LuigiClient from '@luigi-project/client';

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
    case 'Namespaces':
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
    case 'Namespaces':
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
