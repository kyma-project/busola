import { useState } from 'react';

export type ObjectStateType<T> = [T, (key: string, value: any) => void];

export function useObjectState<T>(): ObjectStateType<T> {
  const [objectCache, setObjectCache] = useState<T>({} as T);

  const updateObjectCache = (key: string, value: any) => {
    setObjectCache(oC => ({
      ...oC,
      [key]: value,
    }));
  };

  return [objectCache, updateObjectCache];
}
