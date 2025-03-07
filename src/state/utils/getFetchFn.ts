import { ssoDataState } from 'state/ssoDataAtom';
import { authDataState } from '../authDataAtom';
import { clusterState } from '../clusterAtom';
import { GetRecoilValue } from 'recoil';
import { createFetchFn } from 'shared/hooks/BackendAPI/useFetch';

export const getFetchFn = (get: GetRecoilValue) => {
  const authData = get(authDataState);
  const cluster = get(clusterState);
  const ssoData = get(ssoDataState);

  if (authData && cluster) {
    return createFetchFn({
      authData,
      cluster,
      ssoData,
    });
  }
};
