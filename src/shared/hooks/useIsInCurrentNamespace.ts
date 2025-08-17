import { K8sResource } from 'types';
import pluralize from 'pluralize';
import { useAtomValue } from 'jotai';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { allNodesSelector } from 'state/navigation/allNodesSelector';

export const useIsInCurrentNamespace = (resource: K8sResource) => {
  const namespaceNodes = useAtomValue(allNodesSelector).filter(
    node => node.namespaced,
  );
  const namespace = useAtomValue(activeNamespaceIdState);

  const resourceType = pluralize(resource?.kind?.toLowerCase() || '');
  const resourceNamespace = resource?.metadata?.namespace;
  const hasCurrentNamespace =
    namespace && resourceNamespace ? resourceNamespace === namespace : true;
  const isKnownNamespaceWide = !!namespaceNodes?.find(
    n => n.resourceType === resourceType,
  );

  return !(isKnownNamespaceWide && !hasCurrentNamespace);
};
