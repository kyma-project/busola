import { Getter } from 'jotai';
import { authDataState } from '../authDataAtom';
import { clusterState } from '../clusterAtom';
import { createFetchFn } from 'shared/hooks/BackendAPI/useFetch';

export const getFetchFn = (get: Getter) => {
  const authData = get(authDataState);
  const cluster = get(clusterState);

  if (authData && cluster) {
    return createFetchFn({
      authData,
      cluster,
    });
  }
};
