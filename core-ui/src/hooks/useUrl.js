import { useRecoilValue } from 'recoil';

import { clusterState } from 'state/clusterAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

export const useUrl = () => {
  const currentCluster = useRecoilValue(clusterState);
  const activeNamespace = useRecoilValue(activeNamespaceIdState);
  console.log('currentCluster', currentCluster);

  const clusterUrl = path => {
    return `/cluster/${currentCluster.contextName}/${path}`;
  };
  const namespaceUrl = path => {
    // return `/cluster/${currentCluster}/namespaces/${namespace}/${path}`;
    return `/cluster/${currentCluster.contextName}/namespaces/${activeNamespace}/${path}`;
  };
  const scopedUrl = path => {
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
