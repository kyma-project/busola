/** Full backend URL for an endpoint: backendUrl + '/backend' + endpoint path. */
export function endpointUrl(config, endpoint) {
  return `${config.backendUrl}/backend${endpoint.path}`;
}

/**
 * Build Vegeta JSON targets for every endpoint in the workload. Vegeta's JSON
 * target format wants header values as arrays of strings. GET only — the
 * backend rejects HEAD/OPTIONS on non-proxy paths.
 *
 * @param {object} config resolved config
 * @param {object} headers plain auth headers
 * @returns {{method:string,url:string,header:object}[]}
 */
export function buildTargets(config, headers) {
  const header = {};
  for (const [k, v] of Object.entries(headers)) {
    header[k] = [v];
  }
  return config.endpoints.map((endpoint) => ({
    method: 'GET',
    url: endpointUrl(config, endpoint),
    header,
  }));
}
