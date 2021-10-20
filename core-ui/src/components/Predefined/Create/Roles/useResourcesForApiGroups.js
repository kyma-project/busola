import { useState, useEffect } from 'react';
import { useSingleGet } from 'react-shared';

export function useResourcesForApiGroups(apiGroups = [], groupVersions) {
  const [cache, setCache] = useState({});
  const fetch = useSingleGet();

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
        [apiGroup]: [...cache[apiGroup], ...json.resources],
      }));
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    for (const apiGroup of apiGroups) {
      if (!cache[apiGroup]) {
        setCache({ ...cache, [apiGroup]: [] });
        for (const groupVersion of findMatchingGroupVersions(apiGroup)) {
          fetchApiGroup(groupVersion, apiGroup);
        }
      }
    }
  }, [apiGroups]);

  return cache;
}
