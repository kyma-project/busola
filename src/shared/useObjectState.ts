import { useState } from 'react';
import _ from 'lodash';

export type ObjectStateType<T> = [T, (key: string, value: any) => void];

export function useObjectState<T>(): ObjectStateType<T> {
  const [objectCache, setObjectCache] = useState<T>({} as T);

  const updateObjectCache = (key: string, value: any) => {
    setObjectCache((oldState) => {
      const newState = {
        ...oldState,
        [key]: value,
      };
      if (_.isEqual(oldState, newState)) {
        return oldState;
      }
      return newState;
    });
  };

  return [objectCache, updateObjectCache];
}
