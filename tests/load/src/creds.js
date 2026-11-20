import fs from 'fs';
import { getUpstreamCert } from './certs.js';

/**
 * Assemble proxy credentials for a run.
 *
 * Synthetic-upstream runs (no LOAD_CLUSTER_URL) use the upstream's self-signed
 * cert as CA and a placeholder token — the upstream does not validate auth and
 * the backend only needs a non-empty credential. Real runs (k3d) supply
 * everything via env:
 *   LOAD_CLUSTER_URL, LOAD_K8S_TOKEN, LOAD_CA_FILE,
 *   LOAD_CLIENT_CERT_FILE, LOAD_CLIENT_KEY_FILE, LOAD_SSO_JWT
 *
 * @param {object} config resolved config (authMode, upstream.port)
 * @returns creds object for buildAuthHeaders
 */
export function resolveCreds(config) {
  const mode = config.authMode;
  const usingSynthetic = !process.env.LOAD_CLUSTER_URL;
  const clusterUrl =
    process.env.LOAD_CLUSTER_URL || `https://127.0.0.1:${config.upstream.port}`;
  const creds = { clusterUrl };

  if (process.env.LOAD_CA_FILE) {
    creds.ca = fs.readFileSync(process.env.LOAD_CA_FILE);
  } else if (usingSynthetic) {
    creds.ca = getUpstreamCert().cert;
  }

  if (mode === 'token' || mode === 'sso') {
    creds.token = process.env.LOAD_K8S_TOKEN || 'placeholder-token';
  }
  if (mode === 'cert') {
    if (
      !process.env.LOAD_CLIENT_CERT_FILE ||
      !process.env.LOAD_CLIENT_KEY_FILE
    ) {
      throw new Error(
        'cert mode requires LOAD_CLIENT_CERT_FILE and LOAD_CLIENT_KEY_FILE',
      );
    }
    creds.cert = fs.readFileSync(process.env.LOAD_CLIENT_CERT_FILE);
    creds.key = fs.readFileSync(process.env.LOAD_CLIENT_KEY_FILE);
  }
  if (mode === 'sso') {
    if (!process.env.LOAD_SSO_JWT) {
      throw new Error('sso mode requires LOAD_SSO_JWT');
    }
    creds.ssoJwt = process.env.LOAD_SSO_JWT;
  }
  return creds;
}
