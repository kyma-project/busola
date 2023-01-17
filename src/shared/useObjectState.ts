import { useState, Dispatch, SetStateAction } from 'react';

export type ObjectStateType<T> = [
  T,
  (key: string, value: any) => void,
  Dispatch<SetStateAction<T>>,
];

export function useObjectState<T>(): ObjectStateType<T> {
  const [objectCache, setObjectCache] = useState<T>({} as T);

  const updateObjectCache = (key: string, value: any) => {
    setObjectCache(rC => ({
      ...rC,
      [key]: value,
    }));
  };

  return [objectCache, updateObjectCache, setObjectCache];
}
