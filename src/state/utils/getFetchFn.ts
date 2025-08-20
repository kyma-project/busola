import { Getter } from 'jotai';
import { authDataAtom } from '../authDataAtom';
import { clusterAtom } from '../clusterAtom';
import { createFetchFn } from 'shared/hooks/BackendAPI/useFetch';

export const getFetchFn = (get: Getter) => {
  const authData = get(authDataAtom);
  const cluster = get(clusterAtom);

  if (authData && cluster) {
    return createFetchFn({
      authData,
      cluster,
    });
  }
};
