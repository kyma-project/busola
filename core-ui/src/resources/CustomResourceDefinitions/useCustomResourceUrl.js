import { useRecoilValue } from 'recoil';

import { clusterAndNsNodesSelector } from 'state/navigation/clusterAndNsNodesSelector';
import { useUrl } from 'hooks/useUrl';

export function useCustomResourceUrl(crd) {
  const { resourceUrl, clusterUrl, namespaceUrl } = useUrl();
  const clusterNodes = useRecoilValue(clusterAndNsNodesSelector).filter(
    node => !node.namespaced,
  );
  const namespaceNodes = useRecoilValue(clusterAndNsNodesSelector).filter(
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
      return resourceUrl(cr, { resourceType: clusterNode.pathSegment });
    } else if (namespaceNode) {
      return resourceUrl(cr, { resourceType: namespaceNode.pathSegment });
    } else if (crd.spec.scope === 'Cluster') {
      return clusterUrl(
        `customresources/${crd.metadata.name}/${cr.metadata.name}`,
      );
    } else {
      return namespaceUrl(
        `customresources/${crd.metadata.name}/${cr.metadata.name}`,
      );
    }
  };
}
