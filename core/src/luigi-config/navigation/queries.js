// import { fetchQueue } from 'fetch-queue'; TODO
import { config } from './../config';
import {
  getActiveCluster,
  getActiveClusterName,
} from './../cluster-management/cluster-management';
import { getSSOAuthData } from '../auth/sso';
import { fetchCache } from '../cache/fetch-cache';
import { extractGroupVersions } from '../utils/extractGroupVersions';

export async function failFastFetch(input, auth, init = {}) {
  function createAuthHeaders(auth) {
    if (auth.token) {
      return {
        'X-K8s-Authorization': `Bearer ${auth.token}`,
      };
    } else if (
      auth &&
      auth['client-certificate-data'] &&
      auth['client-key-data']
    ) {
      return {
        'X-Client-Certificate-Data': auth['client-certificate-data'],
        'X-Client-Key-Data': auth['client-key-data'],
      };
    } else {
      throw Error('No available data to authenticate the request.');
    }
  }

  function createSSOHeader() {
    const ssoData = getSSOAuthData();
    if (ssoData) {
      return { Authorization: 'Bearer ' + ssoData.idToken };
    } else {
      return null;
    }
  }

  async function createHeaders(auth) {
    const activeCluster = getActiveCluster();
    const cluster = activeCluster.currentContext.cluster.cluster;
    const requiresCA = activeCluster.config?.requiresCA;

    return {
      ...createSSOHeader(),
      ...createAuthHeaders(auth),
      'Content-Type': 'application/json',
      'X-Cluster-Url': cluster?.server,
      'X-Cluster-Certificate-Authority-Data':
        requiresCA === true || requiresCA === undefined
          ? cluster['certificate-authority-data']
          : undefined,
    };
  }

  const activeClusterName = getActiveClusterName();
  if (!activeClusterName) {
    throw Error(`failFastFetch: no connected cluster (${input})`);
  }

  init.headers = await createHeaders(auth, input);

  return await fetch(input, init);
}

export async function checkIfClusterRequiresCA(auth) {
  try {
    // try to fetch with CA (if 'requiresCA' is undefined => send CA)
    await failFastFetch(config.backendAddress + '/api', auth);
    return true;
  } catch (_) {
    // if it fails, don't send CA anymore
    return false;
  }
}

export async function fetchObservabilityHost(auth, vsPath) {
  const res = await failFastFetch(config.backendAddress + '/' + vsPath, auth, {
    method: 'GET',
  });
  return (await res.json()).spec.hosts[0];
}

export function fetchPermissions(auth, namespace = '*') {
  const ssrr = {
    typeMeta: {
      kind: 'SelfSubjectRulesReview',
      aPIVersion: 'authorization.k8s.io/v1',
    },
    spec: { namespace },
  };

  const ssrUrl = `${config.backendAddress}/apis/authorization.k8s.io/v1/selfsubjectrulesreviews`;
  return failFastFetch(ssrUrl, auth, {
    method: 'POST',
    body: JSON.stringify(ssrr),
  })
    .then(res => res.json())
    .then(res => res.status.resourceRules);
}

export async function fetchAvailableApis() {
  // don't subscribe to '/apis' here - apiGroup features take care of that
  return await fetchCache
    .get('/apis')
    .then(({ data }) => extractGroupVersions(data));
}

export function fetchNamespaces(auth) {
  return failFastFetch(`${config.backendAddress}/api/v1/namespaces/`, auth)
    .then(res => res.json())
    .then(list => list.items.map(ns => ns.metadata));
}
