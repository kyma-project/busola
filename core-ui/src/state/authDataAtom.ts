import { RecoilValue, selector } from 'recoil';
import { clusterState } from './clusterAtom';
import { hasNonOidcAuth } from './openapi/oidc';

export type AuthDataState =
  | { 'client-certificate-data': string; 'client-key-data': string }
  | {
      token: string;
    }
  | null;

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
      return currentCluster.currentContext?.user?.user;
    } else {
      return { token: 'a' };
    }
  },
});
