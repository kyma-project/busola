import pluralize from 'pluralize';
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
  const {
    namespaceId: namespace,
    namespaceNodes,
    clusterNodes,
  } = useMicrofrontendContext();
  const filteredResources = resources?.filter(
    resource => resource?.value !== null,
  );

  const updateState = (index, status, message = '') => {
    setResourcesData(data => {
      data[index] = { ...data[index], status, message };
      return [...data];
    });
  };

  const getUrl = async resource => {
    const resourceType = pluralize(resource.kind.toLowerCase());
    const hasNamespace = !!resource?.metadata?.namespace;
    const isKnownClusterWide = !!clusterNodes.find(
      n => n.resourceType === resourceType,
    );
    const isKnownNamespaceWide = !!namespaceNodes.find(
      n => n.resourceType === resourceType,
    );

    if (hasNamespace || isKnownClusterWide) {
      return getResourceUrl(resource);
    } else if (isKnownNamespaceWide) {
      return getResourceUrl(resource, namespace);
    } else {
      const response = await fetch(getResourceKindUrl(resource));
      const json = await response.json();
      const apiGroupResources = json?.resources;
      const apiGroup = apiGroupResources.find(
        r => r?.kind === resource.value?.kind,
      );
      return apiGroup?.namespaced
        ? getResourceUrl(resource, namespace)
        : getResourceUrl(resource);
    }
  };

  const fetchPossibleExistingResource = async url => {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (_) {
      return null;
    }
  };

  const fetchApiGroup = async (resource, index) => {
    try {
      const url = await getUrl(resource.value);
      const urlWithName = `${url}/${resource?.value?.metadata?.name}`;

      const existingResource = await fetchPossibleExistingResource(urlWithName);

      //add a new resource
      if (!existingResource) {
        await post(url, resource.value);
        updateState(index, 'Created');
      } else {
        //update a resource
        const newResource = {
          ...resource.value,
          ...existingResource,
        };
        const diff = createPatch(existingResource, newResource);
        await patch(urlWithName, diff);
        updateState(index, 'Updated');
      }
    } catch (e) {
      console.warn(e);
      updateState(index, 'Error', e.message);
    }
  };

  const fetchResources = useCallback(() => {
    for (const [index, resource] of filteredResources?.entries()) {
      updateState(index, 'Waiting');
      fetchApiGroup(resource, index);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  useComponentDidMount(fetchResources);

  return fetchResources;
}
