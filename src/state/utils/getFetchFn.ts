import { Getter } from 'jotai';
import { authDataAtom } from '../authDataAtom';
import { clusterAtom } from '../clusterAtom';
import { ssoDataAtom } from '../ssoDataAtom';
import { createFetchFn } from 'shared/hooks/BackendAPI/useFetch';

export const getFetchFn = (get: Getter) => {
  const authData = get(authDataAtom);
  const cluster = get(clusterAtom);
  const ssoData = get(ssoDataAtom);

  if (authData && cluster) {
    return createFetchFn({
      authData,
      cluster,
      ssoData,
    });
  }
};
