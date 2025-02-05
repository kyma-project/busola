import { useRecoilValue } from 'recoil';

import { allNodesSelector } from 'state/navigation/allNodesSelector';
import { useUrl } from 'hooks/useUrl';

export function useCustomResourceUrl(crd) {
  const { clusterUrl, namespaceUrl } = useUrl();
  const clusterNodes = useRecoilValue(allNodesSelector).filter(
    node => !node.namespaced,
  );
  const namespaceNodes = useRecoilValue(allNodesSelector).filter(
    node => node.namespaced,
  );

  return cr => {
    const crdNamePlural = crd.spec.names.plural;
    const clusterNode = clusterNodes.find(
      res => res.resourceType === crdNamePlural,
    );
    const namespaceNode = namespaceNodes.find(
      res => res.resourceType === crdNamePlural,
    );

    if (clusterNode) {
      return clusterUrl(
        `customresources/${crd.metadata.name}/${cr.metadata.name}`,
      );
    } else if (namespaceNode) {
      return namespaceUrl(
        `customresources/${crd.metadata.name}/${cr.metadata.name}`,
        { namespace: cr.metadata.namespace },
      );
    }
  };
}
