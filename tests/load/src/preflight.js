import { endpointUrl } from './targets.js';

/**
 * Issue one request per endpoint and assert expected status (200) AND
 * response shape before any measured traffic. Throws (naming the endpoint)
 * on transport error, non-200 status, non-JSON body, or wrong shape:
 *  - list  → body has an `items` array
 *  - detail → body has `kind` and `metadata`
 *
 * @param {object} config resolved config
 * @param {object} headers plain auth headers
 */
export async function preflight(config, headers) {
  for (const endpoint of config.endpoints) {
    const url = endpointUrl(config, endpoint);
    let res;
    let body;
    try {
      res = await fetch(url, { headers });
      body = await res.text();
    } catch (err) {
      throw new Error(
        `preflight ${endpoint.path}: transport error: ${err.message}`,
      );
    }

    if (res.status !== 200) {
      throw new Error(
        `preflight ${endpoint.path}: expected 200, got ${res.status} (body: ${body.slice(0, 120)})`,
      );
    }

    let json;
    try {
      json = JSON.parse(body);
    } catch {
      throw new Error(`preflight ${endpoint.path}: response is not valid JSON`);
    }

    if (endpoint.kind === 'list') {
      if (!Array.isArray(json.items)) {
        throw new Error(
          `preflight ${endpoint.path}: list response missing items[]`,
        );
      }
    } else if (endpoint.kind === 'detail') {
      if (!json.kind || !json.metadata) {
        throw new Error(
          `preflight ${endpoint.path}: detail response missing kind/metadata`,
        );
      }
    } else {
      throw new Error(
        `preflight ${endpoint.path}: unknown endpoint kind ${JSON.stringify(endpoint.kind)}`,
      );
    }

    console.log(
      `preflight OK: ${endpoint.kind} ${endpoint.path} (${res.status}, ${body.length} bytes)`,
    );
  }
}
