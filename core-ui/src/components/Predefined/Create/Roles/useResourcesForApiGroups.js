import { useState, useEffect, useRef } from 'react';
import { useSingleGet } from 'react-shared';
import { useMicrofrontendContext } from 'react-shared';

export function useResourcesForApiGroups(apiGroups = []) {
  const [cache, setCache] = useState({});
  const fetch = useSingleGet();
  const { groupVersions } = useMicrofrontendContext();
  const previousApiGroupsList = useRef([]);

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

  useEffect(() => {
    if (previousApiGroupsList.current.length === apiGroups.length) return;
    previousApiGroupsList.current = apiGroups;
    for (const apiGroup of apiGroups) {
      if (!cache[apiGroup]) {
        setCache({ ...cache, [apiGroup]: [] });
        for (const groupVersion of findMatchingGroupVersions(apiGroup)) {
          fetchApiGroup(groupVersion, apiGroup);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiGroups]);

  return cache;
}
