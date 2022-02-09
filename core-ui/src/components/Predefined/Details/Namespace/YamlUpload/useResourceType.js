import { useState, useCallback } from 'react';
import { useSingleGet, useMicrofrontendContext } from 'react-shared';
import { useComponentDidMount } from 'shared/useComponentDidMount';
import { getResourceKindUrl, getResourceUrl } from './helpers';

export function useResourceType(resources = []) {
  const [list, setList] = useState([]);
  const fetch = useSingleGet();
  const { namespaceId: namespace } = useMicrofrontendContext();

  const fetchApiGroup = async resource => {
    const kind = resource.resource?.kind;
    const kindUrl = getResourceKindUrl(resource.resource);
    try {
      const response = await fetch(kindUrl);
      const json = await response.json();
      const apiGroupResources = json?.resources;
      const apiGroup = apiGroupResources.find(r => r?.kind === kind);
      const isNamespaceWide = apiGroup?.namespaced;
      resource.url = isNamespaceWide
        ? getResourceUrl(resource.resource, namespace)
        : getResourceUrl(resource.resource);
      setList(list => [...list, resource]);
    } catch (e) {
      console.warn(e);
    }
  };

  const fetchResources = useCallback(() => {
    for (const resource of resources) {
      void fetchApiGroup(resource);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  useComponentDidMount(fetchResources);

  return { list, fetchResources };
}
