import { useRecoilValue } from 'recoil';

import { clusterState } from 'state/clusterAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { UrlGenerators } from 'state/types';

export const useUrl: () => UrlGenerators = () => {
  const currentCluster = useRecoilValue(clusterState);
  const activeNamespace = useRecoilValue(activeNamespaceIdState);

  const clusterUrl = (path: string) => {
    return `/cluster/${currentCluster?.contextName}/${path}`;
  };
  const namespaceUrl = (path: string) => {
    // return `/cluster/${currentCluster}/namespaces/${namespace}/${path}`;
    return `/cluster/${currentCluster?.contextName}/namespaces/${activeNamespace}/${path}`;
  };
  const scopedUrl = (path: string) => {
    if (activeNamespace) {
      return namespaceUrl(path);
    } else {
      return clusterUrl(path);
    }
  };

  return {
    clusterUrl,
    namespaceUrl,
    scopedUrl,
  };
};
