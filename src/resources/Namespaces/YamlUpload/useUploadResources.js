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
import { useAtomValue } from 'jotai';
import { allNodesAtom } from 'state/navigation/allNodesAtom';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import retry from 'shared/utils/retry';

export const STATE_ERROR = 'ERROR';
export const STATE_WAITING = 'WAITING';
export const STATE_UPDATED = 'UPDATED';
export const STATE_CREATED = 'CREATED';

export const getUrl = async (
  resource,
  namespaceId,
  clusterNodes,
  namespaceNodes,
  fetchFn,
) => {
  const resourceType = pluralize(resource.kind.toLowerCase());
  const hasNamespace = !!resource?.metadata?.namespace;
  const isKnownClusterWide = !!clusterNodes.find(
    (n) => n.resourceType === resourceType,
  );
  const isKnownNamespaceWide = !!namespaceNodes.find(
    (n) => n.resourceType === resourceType,
  );

  if (isKnownClusterWide) {
    return getResourceUrl(resource, null);
  } else if (hasNamespace) {
    return getResourceUrl(resource);
  } else if (isKnownNamespaceWide) {
    return getResourceUrl(resource, namespaceId);
  } else {
    const resourceKindUrl = getResourceKindUrl(resource);
    const response = await fetchFn({ relativeUrl: resourceKindUrl });
    const text = await response.text();
    console.log(text);
    const json = JSON.parse(text);
    // const json = await response.json();
    const apiGroupResources = json?.resources;
    const apiGroup = apiGroupResources.find((r) => r?.kind === resource?.kind);
    return apiGroup?.namespaced
      ? getResourceUrl(resource, namespaceId)
      : getResourceUrl(resource);
  }
};

export function useUploadResources(
  resources = [],
  setResourcesData,
  setLastOperationState,
  namespaceId,
) {
  const fetch = useSingleGet();
  const post = usePost();
  const patchRequest = useUpdate();

  const clusterNodes = useAtomValue(allNodesAtom).filter(
    (node) => !node.namespaced,
  );
  const namespaceNodes = useAtomValue(allNodesAtom).filter(
    (node) => node.namespaced,
  );
  const filteredResources = resources?.filter(
    (resource) => resource?.value !== null,
  );

  const updateState = (index, status, message = '') => {
    setResourcesData((data) => {
      if (!data) return null;
      data[index] = { ...data?.[index], status, message };
      return [...data];
    });
  };

  const fetchPossibleExistingResource = async (url) => {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (_) {
      return null;
    }
  };

  const fetchApiGroup = async (resource, index) => {
    const url = await getUrl(
      resource.value,
      namespaceId,
      clusterNodes,
      namespaceNodes,
      fetch,
    );
    const urlWithName = `${url}/${resource?.value?.metadata?.name}`;
    const existingResource = await fetchPossibleExistingResource(urlWithName);
    try {
      //add a new resource
      if (!existingResource) {
        await retry(async () => {
          return await uploadResource(url, resource, post);
        });
        updateState(index, STATE_CREATED);
        setLastOperationState((lastOperationState) =>
          lastOperationState === OPERATION_STATE_WAITING
            ? OPERATION_STATE_SUCCEEDED
            : lastOperationState,
        );
      } else {
        if (
          existingResource?.metadata?.resourceVersion &&
          !resource?.value?.metadata?.resourceVersion
        ) {
          resource.value.metadata.resourceVersion =
            existingResource.metadata.resourceVersion;
        }
        const diff = createPatch(existingResource, resource.value);
        await patchRequest(urlWithName, diff);
        updateState(index, STATE_UPDATED);
        setLastOperationState((lastOperationState) =>
          lastOperationState === OPERATION_STATE_WAITING
            ? OPERATION_STATE_SUCCEEDED
            : lastOperationState,
        );
      }
    } catch (e) {
      console.warn(e);
      updateState(index, STATE_ERROR, e.message);
      setLastOperationState(() => OPERATION_STATE_SOME_FAILED);

      return false;
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

/**
 * Function try to upload resource, if response is 404 it will try to do it again after some time
 * @param url path where the resource should be uploaded
 * @param resource resource to upload
 * @param post function to do POST request
 * @returns {Promise<void>}
 */
async function uploadResource(url, resource, post) {
  try {
    await post(url, resource.value);
  } catch (e) {
    // 404 means that CRD is not available, but it can be uploaded in the same batch
    if (e instanceof HttpError && e.code === 404) {
      return false;
    } else {
      throw e;
    }
  }
  return true;
}
