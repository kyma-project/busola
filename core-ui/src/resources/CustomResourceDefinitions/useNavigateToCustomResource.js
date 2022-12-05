import LuigiClient from '@luigi-project/client';
import { useRecoilValue } from 'recoil';
import { navigateToResource } from 'shared/helpers/universalLinks';
import { clusterAndNsNodesSelector } from 'state/navigation/clusterAndNsNodesSelector';

export function useNavigateToCustomResource() {
  const clusterNodes = useRecoilValue(clusterAndNsNodesSelector).filter(
    node => !node.namespaced,
  );
  const namespaceNodes = useRecoilValue(clusterAndNsNodesSelector).filter(
    node => node.namespaced,
  );

  return (cr, crd) => {
    const crdNamePlural = crd.spec.names.plural;
    const clusterNode = clusterNodes.find(
      res => res.resourceType === crdNamePlural,
    );
    const namespaceNode = namespaceNodes.find(
      res => res.resourceType === crdNamePlural,
    );

    if (clusterNode) {
      navigateToResource({
        name: cr.metadata.name,
        kind: clusterNode.pathSegment,
      });
    } else if (namespaceNode) {
      navigateToResource({
        namespace: cr.metadata.namespace,
        name: cr.metadata.name,
        kind: namespaceNode.pathSegment,
      });
    } else {
      if (crd.spec.scope === 'Cluster') {
        LuigiClient.linkManager()
          .fromContext('cluster')
          .navigate(`customresources/${crd.metadata.name}/${cr.metadata.name}`);
      } else {
        LuigiClient.linkManager()
          .fromContext('cluster')
          .navigate(
            `namespaces/${cr.metadata.namespace}/customresources/${crd.metadata.name}/${cr.metadata.name}`,
          );
      }
    }
  };
}
