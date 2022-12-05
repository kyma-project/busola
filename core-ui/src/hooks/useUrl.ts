import { useMatch } from 'react-router';

import { UrlGenerators } from 'state/types';

export interface UrlOverrides {
  cluster?: string;
  namespace?: string;
}

export const useUrl: () => UrlGenerators = () => {
  const cluster =
    useMatch({ path: '/cluster/:cluster', end: false })?.params?.cluster ?? '';
  const namespace =
    useMatch({ path: '/cluster/:cluster/namespaces/:namespace', end: false })
      ?.params?.namespace ?? '';

  const clusterUrl = (path: string, overrides: UrlOverrides = {}) => {
    return `/cluster/${overrides.cluster ?? cluster}/${path}`;
  };

  const namespaceUrl = (path: string, overrides: UrlOverrides = {}) => {
    return `/cluster/${overrides.cluster ??
      cluster}/namespaces/${overrides.namespace ?? namespace}/${path}`;
  };

  const scopedUrl = (path: string, overrides: UrlOverrides = {}) => {
    if (overrides.namespace ?? namespace) {
      return namespaceUrl(path, overrides);
    } else {
      return clusterUrl(path, overrides);
    }
  };

  const resourceUrl = (resource: any) => {
    return scopedUrl(resource.metadata.name, {
      namespace: resource.metadata.namespace,
    });
  };

  return {
    cluster,
    namespace,
    clusterUrl,
    namespaceUrl,
    scopedUrl,
    resourceUrl,
  };
};
