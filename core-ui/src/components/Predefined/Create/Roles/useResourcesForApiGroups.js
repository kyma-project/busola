import { useState, useCallback } from 'react';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useComponentDidMount } from 'shared/useComponentDidMount';

export function useResourcesForApiGroups(apiGroups = []) {
  const [cache, setCache] = useState({});
  const fetch = useSingleGet();
  const { groupVersions } = useMicrofrontendContext();

  const findMatchingGroupVersions = apiGroup => {
    // core api group
    if (apiGroup === '') return ['v1'];

    return groupVersions.filter(gV => gV.startsWith(apiGroup + '/'));
  };

  const fetchApiGroup = async (groupVersion, apiGroup) => {
    const url = groupVersion === 'v1' ? '/api/v1' : `/apis/${groupVersion}`;
    try {
      const response = await fetch(url);
      const json = await response.json();
      setCache(cache => ({
        ...cache,
        [apiGroup]: cache[apiGroup]
          ? [...cache[apiGroup], ...json.resources]
          : json.resources,
      }));
    } catch (e) {
      console.warn(e);
    }
  };

  const fetchResources = useCallback(() => {
    const cacheObject = apiGroups.reduce((a, v) => ({ ...a, [v]: [] }), {});
    setCache(cacheObject);
    for (const apiGroup of apiGroups) {
      for (const groupVersion of findMatchingGroupVersions(apiGroup)) {
        void fetchApiGroup(groupVersion, apiGroup);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiGroups]);

  useComponentDidMount(fetchResources);

  return { cache, fetchResources };
}
