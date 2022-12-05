import { K8sResource } from 'types';
import pluralize from 'pluralize';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clusterAndNsNodesSelector } from 'state/navigation/clusterAndNsNodesSelector';

export const useIsInCurrentNamespace = (resource: K8sResource) => {
  const namespaceNodes = useRecoilValue(clusterAndNsNodesSelector).filter(
    node => node.namespaced,
  );
  const namespace = useRecoilValue(activeNamespaceIdState);

  const resourceType = pluralize(resource?.kind?.toLowerCase() || '');
  const resourceNamespace = resource?.metadata?.namespace;
  const hasCurrentNamespace =
    namespace && resourceNamespace ? resourceNamespace === namespace : true;
  const isKnownNamespaceWide = !!namespaceNodes?.find(
    n => n.resourceType === resourceType,
  );

  return !(isKnownNamespaceWide && !hasCurrentNamespace);
};
