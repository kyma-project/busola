import { merge } from 'lodash';
import pluralize from 'pluralize';
import { useCallback } from 'react';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { createPatch } from 'rfc6902';

import { useComponentDidMount } from 'shared/useComponentDidMount';
import { getResourceKindUrl, getResourceUrl } from './helpers';
import {
  OPERATION_STATE_SOME_FAILED,
  OPERATION_STATE_SUCCEEDED,
  OPERATION_STATE_WAITING,
} from './YamlUploadDialog';
import { useRecoilValue } from 'recoil';
import { clusterAndNsNodesSelector } from 'state/navigation/clusterAndNsNodesSelector';

export const STATE_ERROR = 'ERROR';
export const STATE_WAITING = 'WAITING';
export const STATE_UPDATED = 'UPDATED';
export const STATE_CREATED = 'CREATED';

export function useUploadResources(
  resources = [],
  setResourcesData,
  setLastOperationState,
  namespaceId,
) {
  const fetch = useSingleGet();
  const post = usePost();
  const patch = useUpdate();
  const clusterNodes = useRecoilValue(clusterAndNsNodesSelector).filter(
    node => !node.namespaced,
  );
  const namespaceNodes = useRecoilValue(clusterAndNsNodesSelector).filter(
    node => node.namespaced,
  );
  const filteredResources = resources?.filter(
    resource => resource?.value !== null,
  );

  const updateState = (index, status, message = '') => {
    setResourcesData(data => {
      if (!data) return null;
      data[index] = { ...data?.[index], status, message };
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

    if (isKnownClusterWide) {
      return getResourceUrl(resource, null);
    } else if (hasNamespace) {
      return getResourceUrl(resource);
    } else if (isKnownNamespaceWide) {
      return getResourceUrl(resource, namespaceId);
    } else {
      const response = await fetch(getResourceKindUrl(resource));
      const json = await response.json();
      const apiGroupResources = json?.resources;
      const apiGroup = apiGroupResources.find(r => r?.kind === resource?.kind);
      return apiGroup?.namespaced
        ? getResourceUrl(resource, namespaceId)
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
        updateState(index, STATE_CREATED);
        setLastOperationState(lastOperationState =>
          lastOperationState === OPERATION_STATE_WAITING
            ? OPERATION_STATE_SUCCEEDED
            : lastOperationState,
        );
      } else {
        //update a resource
        const newResource = merge({}, existingResource, resource.value);
        const diff = createPatch(existingResource, newResource);
        await patch(urlWithName, diff);
        updateState(index, STATE_UPDATED);
        setLastOperationState(lastOperationState =>
          lastOperationState === OPERATION_STATE_WAITING
            ? OPERATION_STATE_SUCCEEDED
            : lastOperationState,
        );
      }
    } catch (e) {
      console.warn(e);
      updateState(index, STATE_ERROR, e.message);
      setLastOperationState(() => OPERATION_STATE_SOME_FAILED);
    }
  };

  const fetchResources = useCallback(() => {
    if (filteredResources?.length) {
      setLastOperationState(OPERATION_STATE_WAITING);
      for (const [index, resource] of filteredResources?.entries()) {
        updateState(index, STATE_WAITING);
        fetchApiGroup(resource, index);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  useComponentDidMount(fetchResources);

  return fetchResources;
}
