import { useState, useCallback } from 'react';
import { useSingleGet, useMicrofrontendContext, usePost } from 'react-shared';
import { useComponentDidMount } from 'shared/useComponentDidMount';
import { getResourceKindUrl, getResourceUrl } from './helpers';

export function useUploadResources(resources = []) {
  const [list, setList] = useState([]);
  const fetch = useSingleGet();
  const post = usePost();
  const { namespaceId: namespace } = useMicrofrontendContext();

  const filteredResources = resources?.filter(
    resource => resource?.value !== null,
  );

  const fetchApiGroup = async resource => {
    const clusterWideResources = [
      '/apis/applicationconnector.kyma-project.io/v1alpha1/applications',
      '/apis/addons.kyma-project.io/v1alpha1/clusteraddonsconfigurations',
      '/apis/storage.k8s.io/v1/storageclasses',
      '/api/v1/persistentvolumes',
      '/apis/rbac.authorization.k8s.io/v1/clusterroles',
      '/apis/rbac.authorization.k8s.io/v1/clusterrolebindings',
      '/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
    ];
    const namespaceWideResources = [];

    const hasNamespace = r => r?.metadata?.namespace;
    const isKnownClusterWide = r =>
      clusterWideResources.includes(getResourceUrl(r));
    const isKnownNamespaceWide = r =>
      namespaceWideResources.includes(getResourceUrl(r));

    const kind = resource.value?.kind;
    const kindUrl = getResourceKindUrl(resource.value);
    try {
      let url;

      if (hasNamespace(resource.value)) {
        url = getResourceUrl(resource.value);
      } else if (isKnownClusterWide(resource.value)) {
        url = getResourceUrl(resource.value);
      } else if (isKnownNamespaceWide(resource.value)) {
        url = getResourceUrl(resource.value, namespace);
      } else {
        const response = await fetch(kindUrl);
        const json = await response.json();
        const apiGroupResources = json?.resources;
        const apiGroup = apiGroupResources.find(r => r?.kind === kind);
        const isNamespaceWide = apiGroup?.namespaced;
        url = isNamespaceWide
          ? getResourceUrl(resource.value, namespace)
          : getResourceUrl(resource.value);
      }
      try {
        await post(url, resource.value);
        resource.status = 'Created';
        setList(list => [...list, resource]);
      } catch (e) {
        console.warn(e);
        resource.status = 'Error';
        setList(list => [...list, resource]);
      }
    } catch (e) {
      console.warn(e);
      resource.status = 'Error';
      setList(list => [...list, resource]);
    }
  };

  const fetchResources = useCallback(() => {
    for (const resource of filteredResources) {
      void fetchApiGroup(resource);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  useComponentDidMount(fetchResources);

  return { list, fetchResources };
}
