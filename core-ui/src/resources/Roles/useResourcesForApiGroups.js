import { useState, useCallback } from 'react';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

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
      return json.resources;
    } catch (e) {
      console.warn(e);
    }
  };

  const fetchResources = useCallback(() => {
    if (loading) return Promise.resolve(cache);

    const loaders = [];
    for (const apiGroup of apiGroups) {
      if (cache[apiGroup]?.length) continue;
      for (const groupVersion of findMatchingGroupVersions(apiGroup)) {
        setLoading(true);
        const loader = fetchApiGroup(
          groupVersion,
          apiGroup,
        )?.then(resources => ({ apiGroup, resources }));
        loaders.push(loader);
      }
    }
    return Promise.all(loaders)?.then(jsons => {
      const newCache = jsons.reduce(
        (cache, { apiGroup, resources }) => ({
          ...cache,
          [apiGroup]: cache[apiGroup]
            ? [...cache[apiGroup], ...resources]
            : resources,
        }),
        cache,
      );
      setCache(newCache);
      setLoading(false);
      return newCache;
    });
  }, [apiGroups]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    cache,
    fetchResources,
    loadable,
    loading,
  };
}
