import { config } from './../config';
import { getActiveCluster } from './../cluster-management';
import { HttpError } from '../../../../shared/hooks/BackendAPI/config';

export async function failFastFetch(input, auth, init = {}) {
  function createAuthHeaders(auth) {
    if (auth.idToken) {
      return { Authorization: `Bearer ${auth.idToken}` };
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

  function createHeaders(auth) {
    const cluster = getActiveCluster().cluster;
    return {
      ...createAuthHeaders(auth),
      'Content-Type': 'application/json',
      'X-Cluster-Url': cluster?.server,
      'X-Cluster-Certificate-Authority-Data':
        cluster && cluster['certificate-authority-data'],
    };
  }

  init.headers = createHeaders(auth);

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
        errorResponse.statusCode ? errorResponse.statusCode : response.status
      );
    } else {
      throw new Error(response);
    }
  }
}

export function fetchBusolaInitData(auth) {
  const crdsUrl = `${config.backendApiUrl}/apis/apiextensions.k8s.io/v1/customresourcedefinitions`;
  const crdsQuery = failFastFetch(crdsUrl, auth)
    .then((res) => res.json())
    .then((data) => ({ crds: data.items.map((crd) => crd.metadata) }));

  const apiGroupsQuery = failFastFetch(config.backendApiUrl, auth)
    .then((res) => res.json())
    .then((data) => ({ apiGroups: data.paths }));

  const ssrr = {
    typeMeta: {
      kind: 'SelfSubjectRulesReview',
      aPIVersion: 'authorization.k8s.io/v1',
    },
    spec: { namespace: '*' },
  };

  const ssrUrl = `${config.backendApiUrl}/apis/authorization.k8s.io/v1/selfsubjectrulesreviews`;
  const ssrrQuery = failFastFetch(ssrUrl, auth, {
    method: 'POST',
    body: JSON.stringify(ssrr),
  })
    .then((res) => res.json())
    .then((res) => ({ selfSubjectRules: res.status.resourceRules }));

  const promises = [crdsQuery, apiGroupsQuery, ssrrQuery];

  return Promise.all(promises).then((res) => Object.assign(...res));
}

export function fetchNamespaces(auth) {
  return failFastFetch(`${config.backendApiUrl}/api/v1/namespaces/`, auth)
    .then((res) => res.json())
    .then((list) => list.items.map((ns) => ns.metadata));
}
