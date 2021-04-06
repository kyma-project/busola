import { config } from './../config';
import { getInitParams } from './../init-params';

const cluster = getInitParams()?.cluster;

export async function failFastFetch(input, token, init = {}) {
  function createHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Cluster-Url': cluster?.server,
      'X-Cluster-Certificate-Authority-Data':
        cluster && cluster['certificate-authority-data'],
    };
  }

  init.headers = createHeaders(token);
  const response = await fetch(input, init);
  if (response.ok) {
    return response;
  } else {
    throw Error(response.statusText);
  }
}

export function fetchBusolaInitData(token) {
  const backendModulesUrl = `${config.backendApiUrl}/apis/ui.kyma-project.io/v1alpha1/backendmodules`;
  const backendModulesQuery = failFastFetch(backendModulesUrl, token)
    .then((res) => res.json())
    .then((data) => ({ backendModules: data.items.map((bM) => bM.metadata) }))
    .catch(() => ({ backendModules: [] }));

  const apiGroupsQuery = failFastFetch(config.backendApiUrl, token)
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
  const ssrrQuery = failFastFetch(ssrUrl, token, {
    method: 'POST',
    body: JSON.stringify(ssrr),
  })
    .then((res) => res.json())
    .then((res) => ({ selfSubjectRules: res.status.resourceRules }));

  const promises = [backendModulesQuery, apiGroupsQuery, ssrrQuery];

  return Promise.all(promises).then((res) => Object.assign(...res));
}

export function fetchNamespaces(token) {
  return failFastFetch(`${config.backendApiUrl}/api/v1/namespaces/`, token)
    .then((res) => res.json())
    .then((list) => list.items.map((ns) => ns.metadata));
}
