import { useState } from 'react';

export function useObjectState() {
  const [resourceCache, setResourceCache] = useState({});

  const updateResourceCache = (key, value) => {
    setResourceCache(rC => ({
      ...rC,
      [key]: value,
    }));
  };

  return [resourceCache, updateResourceCache];
}
