import { useState, useCallback } from 'react';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useAtomValue } from 'jotai';
import { groupVersionsAtom } from 'state/discoverability/groupVersionsAtom';

export function useResourcesForApiGroups(apiGroups = []) {
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(false);
  const fetch = useSingleGet();
  const groupVersions = useAtomValue(groupVersionsAtom);

  const loadable = apiGroups.some((apiGroup) => !cache[apiGroup]);

  const findMatchingGroupVersions = useCallback(
    (apiGroup) => {
      // core api group
      if (apiGroup === '') return ['v1'];

      return groupVersions.filter((gV) => gV.startsWith(apiGroup + '/'));
    },
    [groupVersions],
  );

  const fetchApiGroup = useCallback(
    async (groupVersion) => {
      const url = groupVersion === 'v1' ? '/api/v1' : `/apis/${groupVersion}`;
      try {
        const response = await fetch(url);
        const json = await response.json();
        return json.resources;
      } catch (e) {
        console.warn(e);
      }
    },
    [fetch],
  );

  const fetchResources = useCallback(async () => {
    if (loading) return cache;

    const loaders = [];
    for (const apiGroup of apiGroups) {
      if (cache[apiGroup]?.length) continue;
      for (const groupVersion of findMatchingGroupVersions(apiGroup)) {
        setLoading(true);
        const loader = fetchApiGroup(groupVersion, apiGroup)?.then(
          (resources) => ({ apiGroup, resources }),
        );
        loaders.push(loader);
      }
    }
    const jsons = await Promise.all(loaders);
    const newCache = jsons.reduce(
      (cache, { apiGroup: apiGroup_2, resources: resources_1 }) => ({
        ...cache,
        [apiGroup_2]: cache[apiGroup_2]
          ? [...cache[apiGroup_2], ...resources_1]
          : resources_1,
      }),
      cache,
    );
    setCache(newCache);
    setLoading(false);
    return newCache;
  }, [loading, cache, findMatchingGroupVersions, fetchApiGroup, apiGroups]);

  return {
    cache,
    fetchResources,
    loadable,
    loading,
  };
}
