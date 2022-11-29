import { RecoilValue, selector } from 'recoil';
import { KubeconfigNonOIDCAuth } from 'types';
import { clusterState } from './clusterAtom';
import { hasNonOidcAuth } from './openapi/oidc';

export type AuthDataState = KubeconfigNonOIDCAuth | null;

export const authDataState: RecoilValue<AuthDataState> = selector<
  AuthDataState
>({
  key: 'authDataState',
  get: async ({ get }) => {
    const currentCluster = get(clusterState);
    if (!currentCluster) return null;

    console.log(
      'currentCluster reference changed, TODO make sure to deeply compare',
    );

    const userCredentials = currentCluster.currentContext?.user?.user;
    if (hasNonOidcAuth(userCredentials)) {
      return userCredentials as KubeconfigNonOIDCAuth;
    } else {
      return { token: 'a' }; //todo
    }
  },
});
