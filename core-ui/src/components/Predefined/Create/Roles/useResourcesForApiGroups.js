import { useState, useCallback } from 'react';
import { useSingleGet, useMicrofrontendContext } from 'react-shared';

export function useResourcesForApiGroups(apiGroups = []) {
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(false);
  const fetch = useSingleGet();
  const { groupVersions } = useMicrofrontendContext();

  const loadable = apiGroups.some(apiGroup => !cache[apiGroup]);

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
    if (loading) return;

    const loaders = [];
    for (const apiGroup of apiGroups) {
      if (cache[apiGroup]?.length) continue;
      for (const groupVersion of findMatchingGroupVersions(apiGroup)) {
        setLoading(true);
        const loader = fetchApiGroup(groupVersion, apiGroup);
        loaders.push(loader);
      }
    }
    return Promise.all(loaders).then(() => setLoading(false));
  }, [apiGroups]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    cache,
    fetchResources,
    loadable,
    loading,
  };
}
