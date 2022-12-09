import { useMatch } from 'react-router';
import pluralize from 'pluralize';

import { UrlGenerators } from 'state/types';

export interface UrlOverrides {
  cluster?: string;
  namespace?: string;
  resourceType?: string;
}

export const useUrl: () => UrlGenerators = () => {
  const cluster =
    useMatch({ path: '/cluster/:cluster', end: false })?.params?.cluster ?? '';
  const namespace =
    useMatch({ path: '/cluster/:cluster/namespaces/:namespace', end: false })
      ?.params?.namespace ?? '';

  const clusterUrl = (path: string, overrides: UrlOverrides = {}) => {
    return `/cluster/${overrides?.cluster ?? cluster}/${path}`;
  };

  const namespaceUrl = (path: string, overrides: UrlOverrides = {}) => {
    return `/cluster/${overrides?.cluster ??
      cluster}/namespaces/${overrides?.namespace ?? namespace}/${path}`;
  };

  const scopedUrl = (path: string, overrides: UrlOverrides = {}) => {
    if (overrides?.namespace ?? namespace) {
      return namespaceUrl(path, overrides);
    } else {
      return clusterUrl(path, overrides);
    }
  };

  const resourcePath = (resource: any, overrides: UrlOverrides = {}) =>
    (overrides.resourceType ?? pluralize(resource.kind)).toLowerCase();

  const resourceListUrl = (resource: any, overrides: UrlOverrides = {}) => {
    return scopedUrl(resourcePath(resource, overrides), {
      namespace: resource.metadata.namespace,
      ...overrides,
    });
  };

  const resourceUrl = (resource: any, overrides: UrlOverrides = {}) => {
    const path = `${resourcePath(resource, overrides)}/${
      resource.metadata.name
    }`;
    return scopedUrl(path, {
      namespace: resource.metadata.namespace,
      ...overrides,
    });
  };

  return {
    cluster,
    namespace,
    clusterUrl,
    namespaceUrl,
    scopedUrl,
    resourceListUrl,
    resourceUrl,
  };
};
