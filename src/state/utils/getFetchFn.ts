import { Getter } from 'jotai';
import { authDataAtom } from '../authDataAtom';
import { clusterAtom } from '../clusterAtom';
import { ssoDataAtom } from '../ssoDataAtom';
import { configurationAtom } from '../configuration/configurationAtom';
import { createFetchFn } from 'shared/hooks/BackendAPI/useFetch';

export const getFetchFn = (get: Getter) => {
  const authData = get(authDataAtom);
  const cluster = get(clusterAtom);
  const ssoData = get(ssoDataAtom);
  const configuration = get(configurationAtom);
  const isSSOEnabled = configuration?.features?.SSO_LOGIN?.isEnabled ?? false;

  if (authData && cluster) {
    return createFetchFn({
      authData,
      cluster,
      ssoData,
      isSSOEnabled,
    });
  }
};
