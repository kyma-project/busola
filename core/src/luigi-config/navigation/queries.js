import { config } from './../config';
import { getActiveCluster } from './../cluster-management';
import { HttpError } from '../../../../shared/hooks/BackendAPI/config';

export async function failFastFetch(input, auth, init = {}) {
  function createAuthHeaders(auth) {
    if (auth.token) {
      return { Authorization: `Bearer ${auth.token}` };
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

  async function createHeaders(auth) {
    const params = await getActiveCluster();
    const cluster = params.currentContext.cluster.cluster;
    const requiresCA = params.config?.requiresCA;

    return {
      ...createAuthHeaders(auth),
      'Content-Type': 'application/json',
      'X-Cluster-Url': cluster?.server,
      'X-Cluster-Certificate-Authority-Data': requiresCA
        ? cluster['certificate-authority-data']
        : undefined,
    };
  }

  init.headers = await createHeaders(auth);

  const response = await fetch(input, init);
  if (response.ok) {
    return response;
  } else {
    if (response.json) {
      const errorResponse = await response.json();
      throw new HttpError(
        errorResponse.message && typeof errorResponse.message === 'string'
          ? errorResponse.message
          : response.statusText,
        errorResponse.statusCode ? errorResponse.statusCode : response.status,
      );
    } else {
      throw new Error(response);
    }
  }
}

export async function checkIfClusterRequiresCA(auth) {
  try {
    // try to fetch without CA (requiresCA is undefined)
    await failFastFetch(config.backendAddress, auth);
    return false;
  } catch (_) {
    // if it fails, use CA
    return true;
  }
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

export function fetchBusolaInitData(auth) {
  const crdsUrl = `${config.backendAddress}/apis/apiextensions.k8s.io/v1/customresourcedefinitions`;
  const crdsQuery = failFastFetch(crdsUrl, auth)
    .then(res => res.json())
    .then(data => ({ crds: data.items.map(crd => crd.metadata) }));

  const apiPathsQuery = failFastFetch(config.backendAddress, auth)
    .then(res => res.json())
    .then(data => ({ apiPaths: data.paths }));

  const promises = [crdsQuery, apiPathsQuery];

  return Promise.all(promises).then(res => Object.assign(...res));
}

export function fetchNamespaces(auth) {
  return failFastFetch(`${config.backendAddress}/api/v1/namespaces/`, auth)
    .then(res => res.json())
    .then(list => list.items.map(ns => ns.metadata));
}
