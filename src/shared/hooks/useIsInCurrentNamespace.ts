import { K8sResource } from 'types';
import pluralize from 'pluralize';
import { useAtomValue } from 'jotai';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { allNodesAtomSync } from 'state/navigation/allNodesAtom';

export const useIsInCurrentNamespace = (resource: K8sResource) => {
  const namespaceNodes = useAtomValue(allNodesAtomSync).filter(
    (node) => node.namespaced,
  );
  const namespace = useAtomValue(activeNamespaceIdAtom);

  const resourceType = pluralize(resource?.kind?.toLowerCase() || '');
  const resourceNamespace = resource?.metadata?.namespace;
  const hasCurrentNamespace =
    namespace && resourceNamespace ? resourceNamespace === namespace : true;
  const isKnownNamespaceWide = !!namespaceNodes?.find(
    (n) => n.resourceType === resourceType,
  );

  return !(isKnownNamespaceWide && !hasCurrentNamespace);
};
