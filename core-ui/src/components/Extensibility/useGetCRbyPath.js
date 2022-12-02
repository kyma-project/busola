import { useRecoilValue } from 'recoil';
import pluralize from 'pluralize';

import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clusterState } from 'state/clusterAtom';
import { extensibilityNodesState } from 'state/navigation/extensibilityNodeAtom';

export const useGetCRbyPath = () => {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const extensions = useRecoilValue(extensibilityNodesState);
  const { name: clusterName } = useRecoilValue(clusterState) || {};

  const resource = extensions.find(el => {
    const { scope, urlPath, resource } = el.general || {};
    const extensionPath = urlPath || pluralize(resource?.kind?.toLowerCase());
    const hasCorrectScope =
      (scope?.toLowerCase() === 'namespace') === !!namespaceId;
    if (!hasCorrectScope) return false;

    const crPath = window.location.pathname
      .replace(`/cluster/${clusterName}/`, '')
      .replace(`namespaces/${namespaceId}/`, '')
      .replace('core-ui/', '');

    return crPath.split('/')[0] === extensionPath;
  });

  return resource;
};
