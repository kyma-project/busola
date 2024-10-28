import { AuthDataState } from 'state/authDataAtom';
import { ActiveClusterState } from 'state/clusterAtom';
import Cookies from 'js-cookie';

export function createAuthHeaders(auth: AuthDataState) {
  if (!auth) {
    throw Error('No available data to authenticate the request.');
  }

  if ('token' in auth) {
    Cookies.set('X-K8s-Authorization', `Bearer ${auth.token}`, {
      secure: true,
    });
    return { 'X-K8s-Authorization': `Bearer ${auth.token}` };
  } else if (auth['client-certificate-data'] && auth['client-key-data']) {
    Cookies.set('X-Client-Certificate-Data', auth['client-certificate-data'], {
      secure: true,
    });
    Cookies.set('X-Client-Key-Data', auth['client-key-data'], { secure: true });

    return {
      'X-Client-Certificate-Data': auth['client-certificate-data'],
      'X-Client-Key-Data': auth['client-key-data'],
    };
  }
}

export function createHeaders(
  authData: AuthDataState,
  cluster: ActiveClusterState,
): HeadersInit {
  if (cluster?.currentContext.cluster.cluster.server != null) {
    Cookies.set(
      'X-Cluster-Url',
      cluster?.currentContext.cluster.cluster.server,
      { secure: true },
    );
  }

  Cookies.set(
    'X-Cluster-Certificate-Authority-Data',
    <string>(
      cluster?.currentContext.cluster.cluster['certificate-authority-data']
    ),
    { secure: true },
  );

  return {
    ...createAuthHeaders(authData),
    'X-Cluster-Url': cluster?.currentContext.cluster.cluster.server,
    'X-Cluster-Certificate-Authority-Data':
      cluster?.currentContext.cluster.cluster['certificate-authority-data'],
  } as HeadersInit;
}
