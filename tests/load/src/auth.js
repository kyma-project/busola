function b64(value) {
  if (value == null) return undefined;
  return Buffer.isBuffer(value)
    ? value.toString('base64')
    : Buffer.from(String(value)).toString('base64');
}

/**
 * Build the Busola proxy auth headers for a given mode.
 *
 * Header contract (see backend/kubernetes/handler.js):
 *  - x-cluster-url: raw target API server URL (required)
 *  - x-cluster-certificate-authority-data: base64 CA (optional)
 *  - x-client-certificate-data / x-client-key-data: base64 (cert mode)
 *  - x-k8s-authorization: raw "Bearer <token>" (token/sso modes)
 *  - authorization: raw "Bearer <sso-jwt>" (sso mode only; validated by
 *    express-jwt)
 *
 * @param {'token'|'cert'|'sso'} mode
 * @param {{clusterUrl, token?, ca?, cert?, key?, ssoJwt?}} creds
 * @returns header object
 */
export function buildAuthHeaders(mode, creds = {}) {
  const { clusterUrl, token, ca, cert, key, ssoJwt } = creds;
  if (!clusterUrl) {
    throw new Error('buildAuthHeaders: clusterUrl is required');
  }
  const headers = { 'x-cluster-url': clusterUrl };
  if (ca != null) {
    headers['x-cluster-certificate-authority-data'] = b64(ca);
  }

  switch (mode) {
    case 'token':
      if (!token) {
        throw new Error('buildAuthHeaders: token mode requires token');
      }
      headers['x-k8s-authorization'] = `Bearer ${token}`;
      break;
    case 'cert':
      if (!cert || !key) {
        throw new Error('buildAuthHeaders: cert mode requires cert and key');
      }
      headers['x-client-certificate-data'] = b64(cert);
      headers['x-client-key-data'] = b64(key);
      break;
    case 'sso':
      if (!token) {
        throw new Error('buildAuthHeaders: sso mode requires token');
      }
      if (!ssoJwt) {
        throw new Error('buildAuthHeaders: sso mode requires ssoJwt');
      }
      headers['x-k8s-authorization'] = `Bearer ${token}`;
      headers['authorization'] = `Bearer ${ssoJwt}`;
      break;
    default:
      throw new Error(`buildAuthHeaders: unknown mode ${JSON.stringify(mode)}`);
  }
  return headers;
}

const SECRET_HEADERS = new Set([
  'x-k8s-authorization',
  'authorization',
  'x-client-certificate-data',
  'x-client-key-data',
  'x-cluster-certificate-authority-data',
]);

/** Return a copy of headers with every credential value masked, for logs/reports. */
export function redactHeaders(headers) {
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k] = SECRET_HEADERS.has(k.toLowerCase()) ? '***REDACTED***' : v;
  }
  return out;
}
