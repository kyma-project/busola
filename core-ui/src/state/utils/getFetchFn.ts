import { authDataState } from '../authDataAtom';
import { clusterState } from '../clusterAtom';
import { clusterConfigState } from '../clusterConfigSelector';
import { ssoDataState } from '../ssoDataAtom';
import { configState } from '../configAtom';
import { GetRecoilValue } from 'recoil';
import { createFetchFn } from 'shared/hooks/BackendAPI/useFetch';

export const getFetchFn = (get: GetRecoilValue) => {
  const authData = get(authDataState);
  const cluster = get(clusterState);
  const clusterConfig = get(clusterConfigState);
  const ssoData = get(ssoDataState);
  const { fromConfig } = get(configState) || {};

  if (authData && cluster && clusterConfig && fromConfig) {
    return createFetchFn({
      authData,
      cluster,
      config: clusterConfig,
      ssoData,
      fromConfig,
    });
  }
};
