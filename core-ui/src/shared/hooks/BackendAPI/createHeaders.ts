import { AuthDataState } from 'state/authDataAtom';
import { ActiveClusterState } from 'state/clusterAtom';

export function createAuthHeaders(auth: AuthDataState) {
  if (!auth) {
    throw Error('No available data to authenticate the request.');
  }

  if ('token' in auth) {
    return { 'X-K8s-Authorization': `Bearer ${auth.token}` };
  } else if (auth['client-certificate-data'] && auth['client-key-data']) {
    return {
      'X-Client-Certificate-Data': auth['client-certificate-data'],
      'X-Client-Key-Data': auth['client-key-data'],
    };
  }
}

export function createHeaders(
  authData: AuthDataState,
  cluster: ActiveClusterState,
  requiresCA: boolean,
): HeadersInit {
  return {
    ...createAuthHeaders(authData),
    'X-Cluster-Url': cluster?.currentContext.cluster.cluster.server,
    'X-Cluster-Certificate-Authority-Data': requiresCA
      ? cluster?.currentContext.cluster.cluster['certificate-authority-data']
      : undefined,
  } as HeadersInit;
}
