import { useMatch } from 'react-router';

import { UrlGenerators } from 'state/types';

export const useUrl: () => UrlGenerators = () => {
  const cluster =
    useMatch({ path: '/cluster/:cluster', end: false })?.params?.cluster ?? '';
  const namespace =
    useMatch({ path: '/cluster/:cluster/namespaces/:namespace', end: false })
      ?.params?.namespace ?? '';

  const clusterUrl = (path: string) => {
    return `/cluster/${cluster}/${path}`;
  };
  const namespaceUrl = (path: string) => {
    return `/cluster/${cluster}/namespaces/${namespace}/${path}`;
  };
  const scopedUrl = (path: string) => {
    if (namespace) {
      return namespaceUrl(path);
    } else {
      return clusterUrl(path);
    }
  };

  return {
    cluster,
    namespace,
    clusterUrl,
    namespaceUrl,
    scopedUrl,
  };
};
