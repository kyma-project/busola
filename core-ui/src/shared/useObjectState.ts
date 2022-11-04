import { useState } from 'react';

export function useObjectState<T>() {
  const [objectCache, setObjectCache] = useState<T>({});

  const updateObjectCache = (key: string, value: any) => {
    setObjectCache(rC => ({
      ...rC,
      [key]: value,
    }));
  };

  return [objectCache, updateObjectCache, setObjectCache];
}
