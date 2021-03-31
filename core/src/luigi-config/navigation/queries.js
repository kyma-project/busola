import { config } from './../config';
import { getInitParams } from './../init-params';

const cluster = getInitParams()?.cluster;

function createAuthHeaders(auth) {
  if (auth.idToken) {
    return { Authorization: `Bearer ${auth.idToken}` };
  } else if (auth['client-certificate-data'] && auth['client-key-data']) {
    return {
      'X-Client-Certificate-Data': auth['client-certificate-data'],
      'X_Client-Key-Data': auth['client-key-data'],
    };
  } else {
    throw Error('No available data to authenticate the request.');
  }
}

function createHeaders(auth) {
  return {
    ...createAuthHeaders(auth),
    'Content-Type': 'application/json',
    'X-Cluster-Url': cluster?.server,
    'X-Cluster-Certificate-Authority-Data':
      cluster && cluster['certificate-authority-data'],
  };
}

export function fetchBusolaInitData(auth) {
  const backendModulesQuery = fetch(
    `${config.backendApiUrl}/apis/ui.kyma-project.io/v1alpha1/backendmodules`,
    {
      headers: createHeaders(auth),
    }
  )
    .then((res) => res.json())
    .then((data) => ({ backendModules: data.items.map((bM) => bM.metadata) }))
    .catch(() => ({ backendModules: [] }));

  const apiGroupsQuery = fetch(config.backendApiUrl, {
    headers: createHeaders(auth),
  })
    .then((res) => res.json())
    .then((data) => ({ apiGroups: data.paths }));

  const ssrr = {
    typeMeta: {
      kind: 'SelfSubjectRulesReview',
      aPIVersion: 'authorization.k8s.io/v1',
    },
    spec: { namespace: '*' },
  };

  const ssrrQuery = fetch(
    `${config.backendApiUrl}/apis/authorization.k8s.io/v1/selfsubjectrulesreviews`,
    {
      method: 'POST',
      body: JSON.stringify(ssrr),
      headers: createHeaders(auth),
    }
  )
    .then((res) => res.json())
    .then((res) => ({ selfSubjectRules: res.status.resourceRules }));

  const promises = [backendModulesQuery, apiGroupsQuery, ssrrQuery];

  return Promise.all(promises).then((res) => Object.assign(...res));
}

export function fetchNamespaces(auth) {
  return fetch(`${config.backendApiUrl}/api/v1/namespaces/`, {
    headers: createHeaders(auth),
  })
    .then((res) => res.json())
    .then((list) => list.items.map((ns) => ns.metadata));
}
