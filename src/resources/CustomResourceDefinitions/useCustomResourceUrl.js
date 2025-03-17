import { useUrl } from 'hooks/useUrl';

export function useCustomResourceUrl(crd) {
  const { clusterUrl, namespaceUrl } = useUrl();
  return cr => {
    const crClusterURL = clusterUrl(
      `customresources/${crd.metadata.name}/${cr.metadata.name}`,
    );

    const crNamespaceURL = namespaceUrl(
      `customresources/${crd.metadata.name}/${cr.metadata.name}`,
      { namespace: cr.metadata.namespace },
    );

    if (crd.spec.scope === 'Cluster') {
      return crClusterURL;
    } else {
      return crNamespaceURL;
    }
  };
}
