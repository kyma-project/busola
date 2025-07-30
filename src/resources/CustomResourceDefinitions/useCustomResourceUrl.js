import { useUrl } from 'hooks/useUrl';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

export function useCustomResourceUrl(crd) {
  const { clusterUrl, namespaceUrl } = useUrl();
  const activeNamespaceId = useRecoilValue(activeNamespaceIdState);

  return (cr) => {
    const crClusterURL = clusterUrl(
      `customresources/${crd.metadata.name}/${cr.metadata.name}`,
    );

    const crNamespaceURL = namespaceUrl(
      `customresources/${crd.metadata.name}/${cr.metadata.name}`,
      {
        namespace:
          activeNamespaceId === '-all-' ? '-all-' : cr.metadata.namespace,
      },
    );

    if (crd.spec.scope === 'Cluster') {
      return crClusterURL;
    } else {
      return crNamespaceURL;
    }
  };
}
