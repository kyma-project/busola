import { useCallback } from 'react';
import {
  useSingleGet,
  useMicrofrontendContext,
  usePost,
  useUpdate,
} from 'react-shared';
import { createPatch } from 'rfc6902';

import { useComponentDidMount } from 'shared/useComponentDidMount';
import { getResourceKindUrl, getResourceUrl } from './helpers';

export function useUploadResources(resources = [], setResourcesData) {
  const fetch = useSingleGet();
  const post = usePost();
  const patch = useUpdate();
  const { namespaceId: namespace } = useMicrofrontendContext();

  const filteredResources = resources?.filter(
    resource => resource?.value !== null,
  );

  const updateState = (resource, index, status, message = '') => {
    resource.status = status;
    resource.message = message;
    const updatedList = [...resources];
    updatedList[index] = resource;
    setResourcesData(updatedList);
  };

  const fetchApiGroup = async (resource, index) => {
    const clusterWideResources = [
      '/apis/applicationconnector.kyma-project.io/v1alpha1/applications',
      '/apis/addons.kyma-project.io/v1alpha1/clusteraddonsconfigurations',
      '/apis/storage.k8s.io/v1/storageclasses',
      '/api/v1/persistentvolumes',
      '/apis/rbac.authorization.k8s.io/v1/clusterroles',
      '/apis/rbac.authorization.k8s.io/v1/clusterrolebindings',
      '/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
    ];
    const namespaceWideResources = []; //todo

    const hasNamespace = r => r?.metadata?.namespace;
    const isKnownClusterWide = r =>
      clusterWideResources.includes(getResourceUrl(r));
    const isKnownNamespaceWide = r =>
      namespaceWideResources.includes(getResourceUrl(r));

    const kind = resource.value?.kind;
    const kindUrl = getResourceKindUrl(resource.value);
    try {
      let url;
      let existingResource;

      //check if we need to add a namespace to the metadata
      if (hasNamespace(resource.value)) {
        url = getResourceUrl(resource.value);
      } else if (isKnownClusterWide(resource.value)) {
        url = getResourceUrl(resource.value);
      } else if (isKnownNamespaceWide(resource.value)) {
        url = getResourceUrl(resource.value, namespace);
      } else {
        //get the details of a resource kind to check if we need to add a namespace to the metadata
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
        //check if we need to POST of PATCH based on existance of a resource
        const response = await fetch(
          `${url}/${resource?.value?.metadata?.name}`,
        );
        const json = await response.json();
        existingResource = json;
      } catch (_) {
      } finally {
        try {
          //add a new resource
          if (!existingResource) {
            await post(url, resource.value);
            updateState(resource, index, 'Created');
          } else {
            //update a resource
            const newResource = {
              ...resource.value,
              ...existingResource,
            };
            const diff = createPatch(existingResource, newResource);
            await patch(`${url}/${resource?.value?.metadata?.name}`, diff);
            updateState(resource, index, 'Updated');
          }
        } catch (e) {
          console.warn(e);
          updateState(resource, index, 'Error', e.message);
        }
      }
    } catch (e) {
      console.warn(e);
      updateState(resource, index, 'Error', e.message);
    }
  };

  const fetchResources = useCallback(() => {
    for (const [index, resource] of filteredResources?.entries()) {
      updateState(resource, index, 'Waiting');
      void fetchApiGroup(resource, index);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  useComponentDidMount(fetchResources);

  return { fetchResources };
}
