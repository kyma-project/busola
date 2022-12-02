import { useRecoilValue } from 'recoil';

import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clusterState } from 'state/clusterAtom';
import { extensibilityNodesState } from 'state/navigation/extensibilityNodeAtom';

export const useGetCRbyPath = () => {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const extensions = useRecoilValue(extensibilityNodesState);
  const { name: clusterName } = useRecoilValue(clusterState) || {};

  const resource = extensions.find(el => {
    const { scope, urlPath } = el.general || {};
    const hasCorrectScope =
      (scope?.toLowerCase() === 'namespace') === !!namespaceId;
    if (!hasCorrectScope) return false;

    const crPath = window.location.pathname
      .replace(`/namespaces/${namespaceId}/`, '')
      .replace(`/cluster/${clusterName}/`, '')
      .replace('/core-ui/', '');

    return crPath.split('/')[0] === urlPath;
  });

  return resource;
};
