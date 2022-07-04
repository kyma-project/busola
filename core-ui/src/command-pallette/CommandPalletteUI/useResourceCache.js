import { useState } from 'react';

export function useResourceCache() {
  const [resourceCache, setResourceCache] = useState({});

  const updateResourceCache = (key, value) => {
    setResourceCache(rC => ({
      ...rC,
      [key]: value,
    }));
  };

  return [resourceCache, updateResourceCache];
}
